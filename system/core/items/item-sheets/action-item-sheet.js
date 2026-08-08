// Preparation functions
import {
  prepareActionActivationContext,
  prepareActionDifficultyContext,
  prepareActionTestContext
} from '../scripts/prepare-action-partials.js'
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
export class ActionItemSheet extends HandlebarsApplicationMixin(WoDItemBase) {
  static DEFAULT_OPTIONS = {
    classes: ['wod6e', 'item', 'sheet'],
    position: {
      width: 660
    },
    actions: {}
  }

  static PARTS = {
    header: {
      template: 'systems/wod6e/templates/core/items/action-item-sheet.hbs'
    },
    tabs: {
      template: 'templates/generic/tab-navigation.hbs'
    },
    description: {
      template: 'systems/wod6e/templates/core/items/parts/descriptive-item-page.hbs'
    },
    test: {
      template: 'systems/wod6e/templates/core/items/parts/action-test.hbs'
    },
    difficulty: {
      template: 'systems/wod6e/templates/core/items/parts/action-difficulty.hbs'
    },
    activation: {
      template: 'systems/wod6e/templates/core/items/parts/action-activation.hbs'
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
    const context = await super._prepareContext()
    const item = this.item
    const itemData = item.system

    // Definition lists
    context.actionGroupOptions = WOD6E.configs.ActionGroups.getList({})
    context.actionGroupSelected = itemData?.group || ''

    context.actionRoleOptions = WOD6E.configs.ActionRoles.getList({})
    context.actionRoleSelected = itemData?.role || ''

    context.actionTypeOptions = {
      untyped: {
        label: game.i18n.localize('WOD6E.ACTIONS.Untyped')
      },
      ...WOD6E.configs.AttributeGroups.getList({})
    }
    context.actionTypeSelected = itemData?.actionType || 'untyped'

    return context
  }

  async _preparePartContext(partId, context, options) {
    // Inherit any preparation from the extended class
    context = { ...(await super._preparePartContext(partId, context, options)) }

    // Top-level variables
    const item = this.item

    // Prepare each page context
    switch (partId) {
      case 'description':
        return prepareDescriptionContext(context, item)

      case 'test':
        return prepareActionTestContext(context, item)

      case 'difficulty':
        return prepareActionDifficultyContext(context, item)

      case 'activation':
        return prepareActionActivationContext(context, item)

      case 'settings':
        return prepareItemSettingsContext(context, item)
    }

    return context
  }
}
