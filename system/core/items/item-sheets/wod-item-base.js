// Various button functions
import { _onFormatDataId } from '../scripts/on-format-data-id.js'
import { _onSyncFromDataItem, _onSyncToDataItems } from '../scripts/item-syncing.js'
import {
  _onDocumentPointerDown,
  _onToggleMultiSelect,
  _onToggleMultiSelectOption
} from '../../fields/multiselect.js'
import { ItemUX } from '../scripts/item-ux.js'
import { ActorUX } from '../../actors/scripts/actor-ux.js'
import { _onRemoveItem } from '../scripts/on-remove-item.js'
// Mixin
const { HandlebarsApplicationMixin } = foundry.applications.api

/**
 * Extend the base ItemSheetV2 document
 * @extends {foundry.applications.sheets.ItemSheetV2}
 */
export class WoDItemBase extends HandlebarsApplicationMixin(
  foundry.applications.sheets.ItemSheetV2
) {
  constructor(options = {}) {
    super(options)

    this._dropdownStates = new Set()
  }

  static DEFAULT_OPTIONS = {
    form: {
      submitOnChange: true,
      handler: WoDItemBase.onSubmitItemForm
    },
    window: {
      icon: 'fa-solid fa-dice-d10',
      resizable: true
    },
    classes: ['wod6e', 'item', 'sheet'],
    position: {
      width: 530,
      height: 485
    },
    actions: {
      formatDataId: _onFormatDataId,
      syncFromDataItem: _onSyncFromDataItem,
      syncToDataItems: _onSyncToDataItems,
      removeItem: _onRemoveItem,
      toggleMultiSelect: _onToggleMultiSelect,
      toggleMultiSelectOption: _onToggleMultiSelectOption
    }
  }

  _getHeaderControls() {
    const controls = super._getHeaderControls()
    const item = this.item

    if (item?.isOwned) {
      // Allow this item to have its item updated from an existing data item
      controls.push({
        icon: 'fa-solid fa-down-long',
        label: 'WOD6E.ITEMS.SyncFromDataItem',
        action: 'syncFromDataItem'
      })
    } else {
      // Allow this item to update all data items
      controls.push({
        icon: 'fa-solid fa-up-long',
        label: 'WOD6E.ITEMS.SyncToDataItems',
        action: 'syncToDataItems'
      })
    }

    return controls
  }

  tabGroups = {
    primary: 'description'
  }

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
    const item = this.item
    const actor = this.actor

    // Prepare tabs
    data.tabs = this.getTabs()

    // Determine whether the item can be deleted by the user or not based on permissions
    let canDeleteItem = true
    if (actor) {
      // Here, we check if the user owns the actor (if there is a actor as the item's parent)
      const userOwnsActor =
        actor?.testUserPermission(game.user, CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER) ?? false

      if (userOwnsActor) {
        canDeleteItem = true
      }
    } else {
      // Here, we're checking if the user owns the item (in the case the item has no parent actor)
      // If the user can edit the item, we set canDeleteItem to true
      const userCanEditItem =
        item?.testUserPermission(game.user, CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER) ?? false

      if (userCanEditItem) {
        canDeleteItem = true
      }
    }

    // Transform any data needed for sheet rendering
    return {
      ...data,

      name: item.name,
      img: item.img,

      canDeleteItem,

      dataItemId: item.getFlag('wod6e', 'dataItemId') || '',

      sourcebook: item.system.source.book,
      pageNumber: item.system.source.page
    }
  }

  static async onSubmitItemForm(event, form, formData) {
    this._preserveMultiSelectFields(form, formData)

    const updateData = foundry.utils.expandObject(formData.object)

    await this.item.update(updateData)
  }

  _preRender() {
    // Save scroll position of this render cycle
    ActorUX._saveScrollPositions(this)

    // Save dropdown states of this render cycle
    ItemUX._saveDropdownStates(this)
  }

  async _onRender() {
    // Multiselect dropdown listeners and things
    this._boundMultiSelectOutsideClick ??= _onDocumentPointerDown.bind(this)
    document.addEventListener('pointerdown', this._boundMultiSelectOutsideClick)
    ItemUX._restoreDropdownStates(this)

    // Restore scroll positions from previous render cycle
    ActorUX._restoreScrollPositions(this)
  }

  // Because the multiselect dropdowns are not true form inputs, and all data manipulation
  // is controlled by a data-action, we need to add some logic during the form submission process
  // or else they get overwritten in some circumstances
  _preserveMultiSelectFields(form, formData) {
    const multiSelects = form.querySelectorAll('[data-multi-select][data-field-path]')

    for (const multiSelect of multiSelects) {
      const fieldPath = multiSelect.dataset.fieldPath

      if (!fieldPath) continue

      // If something else is already submitting this field
      // then don't interfere with it
      if (fieldPath in formData.object) continue

      const currentValue = foundry.utils.getProperty(this.item._source, fieldPath)

      if (currentValue === undefined) continue

      formData.object[fieldPath] = foundry.utils.deepClone(currentValue)
    }
  }
}
