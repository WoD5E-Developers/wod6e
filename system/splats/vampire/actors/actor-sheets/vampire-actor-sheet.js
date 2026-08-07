// Base actor sheet to extend from
import { WoDActorBase } from '../../../../core/actors/actor-sheets/wod-actor-base.js'
import { prepareActionsContext } from '../../../../core/actors/scripts/prepare-core-partials.js'
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
    main: {
      template: 'systems/wod6e/templates/splats/vampire/actors/vampire-sheet-body.hbs'
    },
    actions: {
      template: 'systems/wod6e/templates/core/actors/parts/actions.hbs'
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
        },
        {
          id: 'actions',
          icon: 'fa-solid fa-user',
          label: 'WOD6E.TABS.Actions'
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
      // Tabs
      case 'actions':
        return prepareActionsContext(context, actor)

      case 'settings':
        return this.prepareSettingsContext(context, actor)

      case 'limited':
        return this.prepareLimitedContext(context, actor)

      // Main body
      case 'main':
        context = await this.prepareAttributesContext(context, actor)
        context = await this.prepareResourcesContext(context, actor)
        context = await prepareHeaderContext(context, actor)
        context = await prepareHumanityScaleContext(context, actor)
        context = await prepareLeftColumnContext(context, actor)
        context = await prepareMiddleColumnContext(context, actor)
        context = await prepareRightColumnContext(context, actor)
        context = await prepareDisciplinesContext(context, actor)

        return context
    }

    return context
  }
}
