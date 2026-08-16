// Preparation functions
import {
  prepareDescriptionContext,
  prepareItemSettingsContext
} from '../../../../core/items/scripts/prepare-partials.js'
// Base item sheet to extend from
import { WoDItemBase } from '../../../../core/items/item-sheets/wod-item-base.js'
import {
  prepareFrenzyContext,
  prepareBeastContext,
  prepareCurseContext
} from './scripts/prepare-clan-partials.js'
import { prepareMultiSelect } from '../../../../core/fields/multiselect.js'
import { getTargetOptions } from '../../../../core/items/scripts/get-target-options.js'
// Mixin
const { HandlebarsApplicationMixin } = foundry.applications.api

/**
 * Extend the WoDItemBase document
 * @extends {WoDItemBase}
 */
export class ClanItemSheet extends HandlebarsApplicationMixin(WoDItemBase) {
  static DEFAULT_OPTIONS = {
    classes: ['wod6e', 'item', 'sheet'],
    actions: {}
  }

  static PARTS = {
    header: {
      template: 'systems/wod6e/templates/splats/vampire/items/clan-item-sheet.hbs'
    },
    tabs: {
      template: 'templates/generic/tab-navigation.hbs'
    },
    description: {
      template: 'systems/wod6e/templates/core/items/parts/descriptive-item-page.hbs'
    },
    beast: {
      template: 'systems/wod6e/templates/core/items/parts/descriptive-item-page.hbs'
    },
    curse: {
      template: 'systems/wod6e/templates/core/items/parts/descriptive-item-page.hbs'
    },
    frenzy: {
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
    beast: {
      id: 'beast',
      group: 'primary',
      label: 'WOD6E.VAMPIRE.Beast'
    },
    curse: {
      id: 'curse',
      group: 'primary',
      label: 'WOD6E.VAMPIRE.Curse'
    },
    frenzy: {
      id: 'frenzy',
      group: 'primary',
      label: 'WOD6E.VAMPIRE.Frenzy'
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
    const item = this.item
    const itemData = item.system

    context.uuid = item.uuid
    context.level = itemData?.level || 1

    const disciplines = prepareMultiSelect(itemData?.disciplines, getTargetOptions(['disciplines']))
    context.disciplineOptions = disciplines.options
    context.selectedDisciplinesText = disciplines.selectedText

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
        return prepareBeastContext(context, item)
      case 'curse':
        return prepareCurseContext(context, item)
      case 'frenzy':
        return prepareFrenzyContext(context, item)
      case 'settings':
        return prepareItemSettingsContext(context, item)
    }

    return context
  }
}
