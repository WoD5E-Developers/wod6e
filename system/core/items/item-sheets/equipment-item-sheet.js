// Preparation functions
import {
  prepareDescriptionContext,
  prepareItemSettingsContext
} from '../scripts/prepare-partials.js'
import { WoDItemBase } from './wod-item-base.js'

// Base item sheet to extend from

// Mixin
const { HandlebarsApplicationMixin } = foundry.applications.api

/**
 * Extend the WoDItemBase document
 * @extends {WoDItemBase}
 */
export class EquipmentItemSheet extends HandlebarsApplicationMixin(WoDItemBase) {
  static DEFAULT_OPTIONS = {
    classes: ['wod6e', 'item', 'sheet'],
    actions: {}
  }

  static PARTS = {
    header: {
      template: 'systems/wod6e/templates/core/items/equipment-item-sheet.hbs'
    },
    tabs: {
      template: 'templates/generic/tab-navigation.hbs'
    },
    description: {
      template: 'systems/wod6e/templates/core/items/parts/descriptive-item-page.hbs'
    },
    settings: {
      template: 'systems/wod6e/templates/core/items/parts/item-settings.hbs'
    }
  }

  tabs = {
    description: {
      id: 'description',
      group: 'primary',
      label: 'WOD6E.TABS.Description'
    },
    settings: {
      id: 'settings',
      group: 'primary',
      label: 'WOD6E.TABS.Settings'
    }
  }

  async _prepareContext() {
    // Top-level variables
    const data = await super._prepareContext()
    // const item = this.item
    // const itemData = item.system

    return data
  }

  async _preparePartContext(partId, context, options) {
    // Inherit any preparation from the extended class
    context = { ...(await super._preparePartContext(partId, context, options)) }

    // Top-level variables
    const item = this.item

    // Prepare each page context
    switch (partId) {
      // Stats
      case 'description':
        return prepareDescriptionContext(context, item)
      case 'settings':
        return prepareItemSettingsContext(context, item)
    }

    return context
  }
}
