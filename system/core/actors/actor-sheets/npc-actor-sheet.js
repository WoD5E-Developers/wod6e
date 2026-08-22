import { WoDActorBase } from './wod-actor-base.js'
import { prepareConditionsContext } from '../scripts/prepare-core-partials.js'
import { prepareNpcLimitedContext, prepareNpcMainContext } from '../scripts/prepare-npc-partials.js'

const { HandlebarsApplicationMixin } = foundry.applications.api

/**
 * Extend the WoDActorBase document
 * @extends {WoDActorBase}
 */
export class NpcActorSheet extends HandlebarsApplicationMixin(WoDActorBase) {
  static DEFAULT_OPTIONS = {
    classes: ['wod6e', 'actor', 'sheet', 'npc'],
    position: {
      width: 630,
      height: 630
    }
  }

  static PARTS = {
    tabs: {
      template: 'templates/generic/tab-navigation.hbs'
    },
    main: {
      template: 'systems/wod6e/templates/core/actors/npc/npc-sheet-body.hbs'
    },
    conditions: {
      template: 'systems/wod6e/templates/core/actors/parts/conditions.hbs'
    },
    settings: {
      template: 'systems/wod6e/templates/core/actors/npc/settings.hbs'
    },
    limited: {
      template: 'systems/wod6e/templates/core/actors/npc/limited-sheet.hbs'
    }
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
          id: 'conditions',
          icon: 'fa-solid fa-heart-pulse',
          label: 'WOD6E.TABS.Conditions'
        },
        {
          id: 'settings',
          icon: 'fa-solid fa-gear',
          label: 'WOD6E.TABS.Settings'
        }
      ],
      initial: 'main'
    }
  }

  async _prepareContext() {
    const context = await super._prepareContext()
    context.tabs = this._prepareTabs('primary')

    return context
  }

  async _preparePartContext(partId, context, options) {
    context = { ...(await super._preparePartContext(partId, context, options)) }
    const actor = this.actor

    switch (partId) {
      case 'main':
        return prepareNpcMainContext(context, actor)

      case 'conditions':
        return prepareConditionsContext(context, actor)

      case 'settings':
        return this.prepareSettingsContext(context, actor)

      case 'limited':
        return prepareNpcLimitedContext(context, actor)
    }

    return context
  }
}
