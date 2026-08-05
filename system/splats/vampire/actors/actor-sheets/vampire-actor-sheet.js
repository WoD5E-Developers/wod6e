// Base actor sheet to extend from
import { WoDActorBase } from '../../../../core/actors/actor-sheets/wod-actor-base.js'
import {
  prepareDisciplinesContext,
  prepareHeaderContext,
  prepareHumanityScaleContext,
  prepareLeftColumnContext,
  prepareMiddleColumnContext,
  prepareRightColumnContext
} from './scripts/prepare-vampire-partials.js'
// Mixin
const { HandlebarsApplicationMixin } = foundry.applications.api

/**
 * Extend the WoDActorBase document
 * @extends {WoDActorBase}
 */
export class VampireActorSheet extends HandlebarsApplicationMixin(WoDActorBase) {
  static DEFAULT_OPTIONS = {
    classes: ['wod6e', 'actor', 'sheet', 'vampire'],
    actions: {}
  }

  static PARTS = {
    tabs: {
      template: 'templates/generic/tab-navigation.hbs'
    },
    header: {
      template: 'systems/wod6e/templates/splats/vampire/actors/parts/header.hbs'
    },
    attributes: {
      template: 'systems/wod6e/templates/core/actors/parts/attributes.hbs'
    },
    healthWillpower: {
      template: 'systems/wod6e/templates/core/actors/parts/health-willpower.hbs'
    },
    humanityScale: {
      template: 'systems/wod6e/templates/splats/vampire/actors/parts/humanity-scale.hbs'
    },
    leftColumn: {
      template: 'systems/wod6e/templates/splats/vampire/actors/parts/left-column.hbs'
    },
    middleColumn: {
      template: 'systems/wod6e/templates/splats/vampire/actors/parts/middle-column.hbs'
    },
    rightColumn: {
      template: 'systems/wod6e/templates/splats/vampire/actors/parts/right-column.hbs'
    },
    disciplines: {
      template: 'systems/wod6e/templates/splats/vampire/actors/parts/disciplines.hbs'
    },
    settings: {
      template: 'systems/wod6e/templates/core/actors/parts/settings.hbs'
    },
    limited: {
      template: 'systems/wod6e/templates/core/actors/parts/limited-sheet.hbs'
    }
  }

  tabGroups = {
    primary: 'main'
  }

  static TABS = {
    primary: {
      tabs: [
        {
          id: 'main',
          icon: 'fa-solid fa-user',
          label: 'WOD6E.TABS.Main'
        }
      ],
      initial: 'main'
    }
  }

  async _prepareContext() {
    // Top-level variables
    const context = await super._prepareContext()

    // Top-level variables
    const actor = this.actor

    context.tabs = this._prepareTabs('primary')

    context.clan = actor.items.filter((item) => item.type === 'clan')[0]
    context.nature = actor.items.filter((item) => item.type === 'nature')[0]

    return context
  }

  async _preparePartContext(partId, context, options) {
    // Inherit any preparation from the extended class
    context = { ...(await super._preparePartContext(partId, context, options)) }

    // Top-level variables
    const actor = this.actor

    // Prepare each page context
    switch (partId) {
      // Core partials
      case 'attributes':
        return this.prepareAttributesContext(context, actor)

      case 'healthWillpower':
        return this.prepareResourcesContext(context, actor)

      case 'settings':
        return this.prepareSettingsContext(context, actor)

      case 'limited':
        return this.prepareLimitedContext(context, actor)

      // Partials specific to each actor sheet
      case 'header':
        return prepareHeaderContext(context, actor)

      case 'humanityScale':
        return prepareHumanityScaleContext(context, actor)

      case 'leftColumn':
        return prepareLeftColumnContext(context, actor)

      case 'middleColumn':
        return prepareMiddleColumnContext(context, actor)

      case 'rightColumn':
        return prepareRightColumnContext(context, actor)

      case 'disciplines':
        return prepareDisciplinesContext(context, actor)
    }

    return context
  }
}
