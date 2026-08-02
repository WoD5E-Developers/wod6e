// Various button functions
import { _onFormatDataId } from '../scripts/on-format-data-id.js'
import { _onSyncFromDataItem, _onSyncToDataItems } from '../scripts/item-syncing.js'
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
      height: 400
    },
    actions: {
      formatDataId: _onFormatDataId,
      syncFromDataItem: _onSyncFromDataItem,
      syncToDataItems: _onSyncToDataItems
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

    // Determine whether the item is locked from the user or not based on permissions
    let locked = true
    if (actor) {
      // Here, we check if the user owns the actor (if there is a actor as the item's parent)
      // If so, go by the actor's locked state
      const userOwnsActor =
        actor?.testUserPermission(game.user, CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER) ?? false

      if (userOwnsActor) {
        locked = actor?.system?.locked
      }
    } else {
      // Here, we're checking if the user owns the item (in the case the item has no parent actor)
      // If the user can edit the item, we set locked to false
      const userCanEditItem =
        item?.testUserPermission(game.user, CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER) ?? false

      if (userCanEditItem) {
        locked = false
      }
    }

    // Transform any data needed for sheet rendering
    return {
      ...data,

      name: item.name,
      img: item.img,

      locked,

      dataItemId: item.getFlag('wod6e', 'dataItemId') || '',

      sourcebook: item.system.source.book,
      pageNumber: item.system.source.page
    }
  }

  static async onSubmitItemForm(event, form, formData) {
    // Process submit data
    const submitData = this._prepareSubmitData(event, form, formData)

    // Update the item data
    await this.item.update(submitData)
  }
}
