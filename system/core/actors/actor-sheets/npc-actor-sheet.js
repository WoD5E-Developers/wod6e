import { WoDActorBase } from './wod-actor-base.js'
import {
  _onConfigureNpcDisciplines,
  _onConfigureNpcSkillPools
} from '../scripts/on-configure-npc-traits.js'
import { prepareConditionsContext } from '../scripts/prepare-core-partials.js'
import { _onRollNpcPool } from '../scripts/on-roll.js'
import {
  prepareNpcAbilitiesContext,
  prepareNpcLimitedContext,
  prepareNpcMainContext
} from '../scripts/prepare-npc-partials.js'

const { HandlebarsApplicationMixin } = foundry.applications.api

/**
 * Extend the WoDActorBase document
 * @extends {WoDActorBase}
 */
export class NpcActorSheet extends HandlebarsApplicationMixin(WoDActorBase) {
  static DEFAULT_OPTIONS = {
    classes: ['wod6e', 'actor', 'sheet', 'npc'],
    actions: {
      configureNpcSkillPools: _onConfigureNpcSkillPools,
      configureNpcDisciplines: _onConfigureNpcDisciplines,
      rollNpcPool: _onRollNpcPool,
      adjustNpcResourceMax: NpcActorSheet.#adjustResourceMax
    },
    position: {
      width: 630,
      height: 750
    }
  }

  static async #adjustResourceMax(_event, target) {
    const { actor } = this
    const { resource, delta } = target.dataset
    const change = Number(delta)
    if (
      !actor.isOwner ||
      !['health', 'willpower'].includes(resource) ||
      ![-1, 1].includes(change)
    ) {
      return
    }
    if (resource === 'health' && actor.system.isMinion) return

    const tracker = actor.system[resource]
    const max = Math.max(1, tracker.max + change)
    if (max === tracker.max) return

    const update = { [`system.${resource}.max`]: max }
    const usableMax = Math.max(0, max - tracker.disabled)
    if (tracker.value > usableMax) update[`system.${resource}.value`] = usableMax
    await actor.update(update)
  }

  static PARTS = {
    tabs: {
      template: 'templates/generic/tab-navigation.hbs'
    },
    main: {
      template: 'systems/wod6e/templates/core/actors/npc/npc-sheet-body.hbs'
    },
    abilities: {
      template: 'systems/wod6e/templates/core/actors/npc/abilities.hbs'
    },
    biography: {
      template: 'systems/wod6e/templates/core/actors/parts/biography.hbs'
    },
    conditions: {
      template: 'systems/wod6e/templates/core/actors/parts/conditions.hbs'
    },
    settings: {
      template: 'systems/wod6e/templates/core/actors/parts/settings.hbs'
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
          id: 'abilities',
          icon: 'fa-solid fa-bolt',
          label: 'WOD6E.TABS.Abilities'
        },
        {
          id: 'biography',
          icon: 'fa-solid fa-book-open',
          label: 'WOD6E.TABS.Biography'
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

      case 'abilities':
        return prepareNpcAbilitiesContext(context, actor)

      case 'biography':
        return this.prepareBiographyContext(context, actor)

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
