// Preparation functions
import {
  prepareDescriptionContext,
  prepareItemSettingsContext
} from '../scripts/prepare-partials.js'
import {
  prepareConditionDetailsContext,
  prepareConditionEffectsContext
} from '../scripts/prepare-condition-partials.js'
// Base item sheet to extend from
import { WoDItemBase } from './wod-item-base.js'

// Mixin
const { HandlebarsApplicationMixin } = foundry.applications.api

/**
 * Extend the WoDItemBase document
 * @extends {WoDItemBase}
 */
export class ConditionItemSheet extends HandlebarsApplicationMixin(WoDItemBase) {
  static DEFAULT_OPTIONS = {
    classes: ['wod6e', 'item', 'sheet'],
    actions: {
      addEffect: ConditionItemSheet.#onAddEffect,
      deleteEffect: ConditionItemSheet.#onDeleteEffect
    }
  }

  static PARTS = {
    header: {
      template: 'systems/wod6e/templates/core/items/condition-item-sheet.hbs'
    },
    tabs: {
      template: 'templates/generic/tab-navigation.hbs'
    },
    description: {
      template: 'systems/wod6e/templates/core/items/parts/descriptive-item-page.hbs'
    },
    condition: {
      template: 'systems/wod6e/templates/core/items/parts/condition-details.hbs'
    },
    effects: {
      template: 'systems/wod6e/templates/core/items/parts/condition-effects.hbs'
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
    condition: {
      id: 'condition',
      group: 'primary',
      label: 'WOD6E.TABS.Condition'
    },
    effects: {
      id: 'effects',
      group: 'primary',
      label: 'WOD6E.TABS.Effects'
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

    const condition = item.system?.condition ?? {}

    context.conditionDurationOptions = WOD6E.configs.Durations.getList({})
    context.conditionDurationSelected = condition.duration ?? 'manual'

    return context
  }

  async _preparePartContext(partId, context, options) {
    // Inherit any preparation from the extended class
    context = {
      ...(await super._preparePartContext(partId, context, options))
    }

    // Top-level variables
    const item = this.item

    // Prepare each page context
    switch (partId) {
      case 'description':
        return prepareDescriptionContext(context, item)

      case 'condition':
        return prepareConditionDetailsContext(context, item)

      case 'effects':
        return prepareConditionEffectsContext(context, item)

      case 'settings':
        return prepareItemSettingsContext(context, item)
    }

    return context
  }

  // Add a new effect to the condition
  static async #onAddEffect() {
    const effects = this.item.system.effects ?? []

    effects.push({
      type: 'dice',
      mode: 'add',
      value: 0
    })

    await this.item.update({
      'system.effects': effects
    })
  }

  // Delete an effect from the condition
  static async #onDeleteEffect(_event, target) {
    const index = Number(target.dataset.effectIndex)

    if (!Number.isInteger(index)) {
      return
    }

    const effects = foundry.utils.deepClone(this.item.system.effects ?? [])

    if (!effects[index]) {
      return
    }

    effects.splice(index, 1)

    await this.item.update({
      'system.effects': effects
    })
  }
}
