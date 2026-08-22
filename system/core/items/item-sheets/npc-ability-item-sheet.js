import {
  prepareActivationContext,
  prepareDescriptionContext,
  prepareItemSettingsContext
} from '../scripts/prepare-partials.js'
import { buildEnrichedField } from '../scripts/build-enriched-field.js'
import { WoDItemBase } from './wod-item-base.js'

const { HandlebarsApplicationMixin } = foundry.applications.api

export class NpcAbilityItemSheet extends HandlebarsApplicationMixin(WoDItemBase) {
  static DEFAULT_OPTIONS = {
    classes: ['wod6e', 'item', 'sheet', 'npc-item'],
    position: {
      width: 660
    },
    actions: {}
  }

  static PARTS = {
    header: {
      template: 'systems/wod6e/templates/core/items/npc-ability-item-sheet.hbs'
    },
    tabs: {
      template: 'templates/generic/tab-navigation.hbs'
    },
    description: {
      template: 'systems/wod6e/templates/core/items/parts/descriptive-item-page.hbs'
    },
    activation: {
      template: 'systems/wod6e/templates/core/items/parts/activation-page.hbs'
    },
    requirements: {
      template: 'systems/wod6e/templates/core/items/parts/npc-ability-requirements-page.hbs'
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
    activation: {
      id: 'activation',
      group: 'primary',
      label: 'WOD6E.TABS.Activation'
    },
    requirements: {
      id: 'requirements',
      group: 'primary',
      label: 'WOD6E.TABS.Requirements'
    },
    settings: {
      id: 'settings',
      group: 'primary',
      label: 'WOD6E.TABS.Settings'
    }
  }

  async _prepareContext() {
    const context = await super._prepareContext()

    context.uses = this.item.system.uses
    context.recoveryPeriodOptions = WOD6E.configs.Durations.getList({})
    context.recoveryPeriodSelected = this.item.system.uses.period

    return context
  }

  async _preparePartContext(partId, context, options) {
    context = { ...(await super._preparePartContext(partId, context, options)) }

    switch (partId) {
      case 'description':
        return prepareDescriptionContext(context, this.item)

      case 'activation':
        return prepareActivationContext(context, this.item)

      case 'requirements':
        context.tab = context.tabs.requirements
        context.requirements = await buildEnrichedField({
          path: 'system.requirements',
          value: this.item.system.requirements
        })
        return context

      case 'settings':
        return prepareItemSettingsContext(context, this.item)
    }

    return context
  }
}
