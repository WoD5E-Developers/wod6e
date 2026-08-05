// Actor UX functions

import { ActorUX } from '../scripts/actor-ux.js'
import { _onSetTrackerValue } from '../scripts/on-set-tracker-value.js'
import { _onDisableTrackerValue } from '../scripts/on-disable-tracker-value.js'
import {
  prepareAttributesContext,
  prepareLimitedContext,
  prepareResourcesContext,
  prepareSettingsContext
} from '../scripts/prepare-core-partials.js'
import { _onCreateItem, _onSearchItem } from '../scripts/item-actions.js'
import { _onOpenItem } from '../../applications/compendium-browser/scripts/on-open-item.js'
// Mixin
const { HandlebarsApplicationMixin } = foundry.applications.api

/**
 * Extend the base ActorSheetV2 document
 * @extends {foundry.applications.sheets.ActorSheetV2}
 */
export class WoDActorBase extends HandlebarsApplicationMixin(
  foundry.applications.sheets.ActorSheetV2
) {
  get title() {
    return this.actor.isToken ? `[Token] ${this.actor.name}` : this.actor.name
  }

  constructor(options = {}) {
    super(options)

    this.#dragDrop = this.#createDragDropHandlers()
    this._collapsibleStates = new Map()
  }

  static DEFAULT_OPTIONS = {
    form: {
      submitOnChange: true,
      handler: WoDActorBase.onSubmitActorForm
    },
    window: {
      icon: 'fa-solid fa-dice-d10',
      resizable: true
    },
    classes: ['wod6e', 'actor', 'sheet'],
    position: {
      width: 950,
      height: 1050
    },
    actions: {
      setTrackerValue: _onSetTrackerValue,
      createItem: _onCreateItem,
      searchItem: _onSearchItem,
      openItem: _onOpenItem
    },
    dragDrop: [
      {
        dragSelector: '[data-drag]',
        dropSelector: null
      }
    ]
  }

  _getHeaderControls() {
    const controls = super._getHeaderControls()

    return controls
  }

  tabGroups = {
    primary: 'main'
  }

  tabs = {}

  getTabs() {
    const tabs = this.tabs

    // Remove hidden tabs
    for (const key in tabs) {
      if (tabs[key].hidden) delete tabs[key]
    }

    for (const tab of Object.values(tabs)) {
      tab.active = this.tabGroups[tab.group] === tab.id
      tab.cssClass = tab.active ? 'active' : ''
    }

    return tabs
  }

  async _prepareContext() {
    // Top-level variables
    const data = await super._prepareContext()
    const actor = this.actor
    const actorData = actor.system

    // Prepare tabs
    data.tabs = this.getTabs()

    // Define the data the template needs

    // Prepare items
    await this.prepareItems(actor)

    let locked = true
    const userOwnsActor =
      actor?.testUserPermission(game.user, CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER) ?? false
    if (userOwnsActor) {
      locked = actorData.locked
    }

    // Transform any data needed for sheet rendering
    return {
      ...data,

      name: actor.name,
      img: actor.img,

      health: actorData.health,

      settings: actorData.settings,

      isOwner: actor.isOwner,
      locked
    }
  }

  async prepareItems(sheetData) {
    // Make an array to store item-based modifiers
    sheetData.system.itemModifiers = []
  }

  static async onSubmitActorForm(event, form, formData) {
    const target = event.target

    // We do this because it was supported in the old system, and we still want
    // users to be able to change between character types painlessly
    if (target.name === 'type') {
      // Maintain a copy of the old 'system' object
      const oldSystemObject = foundry.utils.deepClone(this.actor.system)

      // Update the actor type (Foundry requires you to replace the 'system' object while doing this)
      await this.actor.update(
        {
          type: target.value,
          system: {}
        },
        {
          recursive: false
        }
      )

      // Ensure the actor's old data gets put back in place
      await this.actor.update({
        system: oldSystemObject
      })
    }

    // Handle odd quirks with updating special inputs
    if (target.tagName === 'INPUT') {
      let value

      // Handle numbers and strings properly
      if (target.type === 'number') {
        value = parseInt(target.value)
      } else if (target.type === 'checkbox') {
        value = target.checked
      } else {
        value = target.value
      }

      // Make the update for the field
      this.actor.update({
        [`${target.name}`]: value
      })
    } else {
      // Process submit data
      const submitData = this._prepareSubmitData(event, form, formData)

      // Overrides
      const overrides = foundry.utils.flattenObject(this.actor.overrides)
      for (const k of Object.keys(overrides)) delete submitData[k]

      const submitDataFlat = foundry.utils.flattenObject(submitData)
      const updatedData = {
        [target.name]: submitDataFlat[target.name]
      }
      const expandedData = foundry.utils.expandObject(updatedData)

      // Update the actor data
      await this.actor.update(expandedData)
    }
  }

  _configureRenderOptions(options) {
    super._configureRenderOptions(options)

    // If the document is in limited view, only show the limited view;
    // otherwise, don't include the limited part
    if (this.document.limited) {
      options.parts = ['limited']
    } else {
      options.parts = options.parts.filter((item) => item !== 'limited')
    }
  }

  _preRender() {
    ActorUX._saveScrollPositions(this)
    ActorUX._saveCollapsibleStates(this)
  }

  async _onRender() {
    const html = this.element

    // Update the window title (since ActorSheetV2 doesn't do it automatically)
    this.window.title.textContent = this.title

    // Toggle whether the sheet is locked or not
    if (this.actor.system.locked) {
      html.classList.add('locked')
    } else {
      html.classList.remove('locked')
    }

    // Drag and drop functionality
    this.#dragDrop.forEach((d) => d.bind(this.element))

    // Right click to disable tracker dot functionality
    html.querySelectorAll('.resource-tracker-space').forEach((element) => {
      element.addEventListener('contextmenu', _onDisableTrackerValue.bind(this))
    })

    // Restore scroll positions from previous render cycle
    ActorUX._restoreScrollPositions(this)
  }

  #createDragDropHandlers() {
    return this.options.dragDrop.map((d) => {
      d.permissions = {
        dragstart: this._canDragStart.bind(this),
        drop: this._canDragDrop.bind(this)
      }

      d.callbacks = {
        dragstart: this._onDragStart.bind(this),
        dragover: this._onDragOver.bind(this),
        drop: this._onDrop.bind(this)
      }
      return new foundry.applications.ux.DragDrop(d)
    })
  }

  #dragDrop

  _canDragStart() {
    return this.isEditable
  }

  _canDragDrop() {
    return this.isEditable
  }

  _onDragStart(event) {
    const dataset = event.target.dataset
    if ('link' in dataset) return

    // Extract the data you need
    const dragData = {
      type: dataset.type,
      uuid: dataset.documentUuid
    }

    if (!dragData) return

    // Set data transfer
    event.dataTransfer.setData('text/plain', JSON.stringify(dragData))
  }

  _onDragOver() {}

  async _onDrop(event) {
    const data = foundry.applications.ux.TextEditor.implementation.getDragEventData(event)

    // Handle different data types
    switch (data.type) {
      case 'Item':
        return ActorUX._onDropItem(event, this.actor, data)
    }
  }

  // This may seem silly to do since other actor sheets
  // can just import these values from the filepath, but
  // we do this so that custom actor sheets can access
  // core prepareContext functions directly by extending
  // the base actor sheet.
  prepareAttributesContext(context, actor) {
    return prepareAttributesContext(context, actor)
  }

  prepareResourcesContext(context, actor) {
    return prepareResourcesContext(context, actor)
  }

  prepareSettingsContext(context, actor) {
    return prepareSettingsContext(context, actor)
  }

  prepareLimitedContext(context, actor) {
    return prepareLimitedContext(context, actor)
  }
}
