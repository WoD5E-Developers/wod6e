// Preparation functions
import {
  prepareActivationContext,
  prepareDescriptionContext,
  prepareDifficultyContext,
  prepareItemSettingsContext,
  prepareTestContext
} from '../../../../core/items/scripts/prepare-partials.js'
// Base item sheet to extend from
import { WoDItemBase } from '../../../../core/items/item-sheets/wod-item-base.js'
import { prepareMaturingContext } from './scripts/prepare-discipline-partials.js'
import { _onAddMaturing, _onRemoveMaturing } from './scripts/maturing-buttons.js'
// Mixin
const { HandlebarsApplicationMixin } = foundry.applications.api

/**
 * Extend the WoDItemBase document
 * @extends {WoDItemBase}
 */
export class DisciplineItemSheet extends HandlebarsApplicationMixin(WoDItemBase) {
  static DEFAULT_OPTIONS = {
    classes: ['wod6e', 'item', 'sheet'],
    actions: {
      addMaturing: _onAddMaturing,
      removeMaturing: _onRemoveMaturing
    }
  }

  static PARTS = {
    header: {
      template: 'systems/wod6e/templates/splats/vampire/items/discipline-item-sheet.hbs'
    },
    tabs: {
      template: 'templates/generic/tab-navigation.hbs'
    },
    description: {
      template: 'systems/wod6e/templates/core/items/parts/descriptive-item-page.hbs'
    },
    maturing: {
      template: 'systems/wod6e/templates/splats/vampire/items/parts/discipline-maturing-page.hbs'
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
    maturing: {
      id: 'maturing',
      group: 'primary',
      label: 'WOD6E.TABS.Maturing'
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
    const context = await super._prepareContext()
    const item = this.item
    const itemData = item.system

    context.level = itemData?.level || 1

    context.attributeOptions = WOD6E.configs.AttributeGroups.getList({})
    context.attributeSelected = itemData?.attribute

    context.disciplineTypeOptions = WOD6E.configs.Disciplines.getList({})
    context.disciplineTypeSelected = itemData?.disciplineType

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

      case 'maturing':
        return prepareMaturingContext(context, item)

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
