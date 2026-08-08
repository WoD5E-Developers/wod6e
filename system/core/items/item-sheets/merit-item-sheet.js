// Preparation functions
import {
  prepareDescriptionContext,
  prepareTestContext,
  prepareDifficultyContext,
  prepareActivationContext,
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
export class MeritItemSheet extends HandlebarsApplicationMixin(WoDItemBase) {
  static DEFAULT_OPTIONS = {
    classes: ['wod6e', 'item', 'sheet'],
    actions: {}
  }

  static PARTS = {
    header: {
      template: 'systems/wod6e/templates/core/items/merit-item-sheet.hbs'
    },
    tabs: {
      template: 'templates/generic/tab-navigation.hbs'
    },
    description: {
      template: 'systems/wod6e/templates/core/items/parts/descriptive-item-page.hbs'
    },
    test: {
      template: 'systems/wod6e/templates/core/items/parts/test-page.hbs'
    },
    difficulty: {
      template: 'systems/wod6e/templates/core/items/parts/difficulty-page.hbs'
    },
    activation: {
      template: 'systems/wod6e/templates/core/items/parts/activation-page.hbs'
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
    test: {
      id: 'test',
      group: 'primary',
      label: 'WOD6E.TABS.Test'
    },
    difficulty: {
      id: 'difficulty',
      group: 'primary',
      label: 'WOD6E.TABS.Difficulty'
    },
    activation: {
      id: 'activation',
      group: 'primary',
      label: 'WOD6E.TABS.Activation'
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

      case 'test':
        return prepareTestContext(context, item)

      case 'difficulty':
        return prepareDifficultyContext(context, item)

      case 'activation':
        return prepareActivationContext(context, item)

      case 'settings':
        return prepareItemSettingsContext(context, item)
    }

    return context
  }
}
