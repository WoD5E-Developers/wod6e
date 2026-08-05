// Preparation functions
import {
  prepareDescriptionContext,
  prepareItemSettingsContext
} from '../../../../core/items/scripts/prepare-partials.js'
// Base item sheet to extend from
import { WoDItemBase } from '../../../../core/items/item-sheets/wod-item-base.js'
import {
  _onToggleMultiSelect,
  _onToggleMultiSelectOption
} from '../../../../core/fields/multiselect.js'
// Mixin
const { HandlebarsApplicationMixin } = foundry.applications.api

/**
 * Extend the WoDItemBase document
 * @extends {WoDItemBase}
 */
export class ClanTraitItemSheet extends HandlebarsApplicationMixin(WoDItemBase) {
  static DEFAULT_OPTIONS = {
    classes: ['wod6e', 'item', 'sheet'],
    actions: {
      toggleMultiSelect: _onToggleMultiSelect,
      toggleMultiSelectOption: _onToggleMultiSelectOption
    }
  }

  static PARTS = {
    header: {
      template: 'systems/wod6e/templates/splats/vampire/items/clan-trait-item-sheet.hbs'
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
    const context = await super._prepareContext()
    // const item = this.item
    // const itemData = item.system

    return context
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
      case 'beast':
      case 'settings':
        return prepareItemSettingsContext(context, item)
    }

    return context
  }
}
