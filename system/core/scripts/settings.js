//import { StorytellerMenu } from '../applications/storyteller-menu.js'
/* Definitions */
import { Attributes } from '../config/attributes.js'
import { Skills } from '../config/skills.js'
import { Disciplines } from '../../splats/vampire/config/disciplines.js'
import { ResourceTypes } from '../config/resource-types.js'
import { ActionGroups } from '../config/action-groups.js'
import { ActionRoles } from '../config/action-roles.js'
import { Activations } from '../config/activation-types.js'
import { Difficulties } from '../config/difficulties.js'
import { Distances } from '../config/distances.js'
import { Durations } from '../config/durations.js'

/**
 * Define all game settings here
 * @return {Promise}
 */
export const loadSettings = async function () {
  /*
    Storyteller Settings
  */

  // Register the storyteller menu
  /**
  game.settings.registerMenu('wod6e', 'storytellerMenu', {
    name: game.i18n.localize('WOD6E.Settings.StorytellerMenu'),
    hint: game.i18n.localize('WOD6E.Settings.StorytellerMenuHint'),
    label: game.i18n.localize('WOD6E.Settings.StorytellerMenu'),
    icon: 'fas fa-bars',
    type: StorytellerMenu,
    restricted: true
  })
   */

  const modCustomList = {
    attribute: {
      defCategory: 'Attributes',
      defClass: Attributes
    },
    skill: {
      defCategory: 'Skills',
      defClass: Skills
    },
    discipline: {
      defCategory: 'Disciplines',
      defClass: Disciplines
    },
    resourceTypes: {
      defCategory: 'ResourceTypes',
      defClass: ResourceTypes
    },
    actionGroups: {
      defCategory: 'ActionGroups',
      defClass: ActionGroups
    },
    actionRoles: {
      defCategory: 'ActionRoles',
      defClass: ActionRoles
    },
    activations: {
      defCategory: 'Activations',
      defClass: Activations
    },
    difficulties: {
      defCategory: 'Difficulties',
      defClass: Difficulties
    },
    distances: {
      defCategory: 'Distances',
      defClass: Distances
    },
    durations: {
      defCategory: 'Durations',
      defClass: Durations
    }
  }

  for (const [, value] of Object.entries(modCustomList)) {
    // Register the modification
    game.settings.register('wod6e', `modified${value.defCategory}`, {
      name: game.i18n.localize(`WOD6E.Settings.Modified${value.defCategory}`),
      hint: game.i18n.localize(`WOD6E.Settings.Modified${value.defCategory}Hint`),
      scope: 'world',
      config: false,
      default: [],
      type: Array,
      onChange: async () => {
        // Re-render the storyteller menu window once settings are updated
        _rerenderStorytellerWindow()

        // Re-init labels
        await value.defClass.initializeLabels()
      }
    })

    // Register the custom subtype
    game.settings.register('wod6e', `custom${value.defCategory}`, {
      name: game.i18n.localize(`WOD6E.Settings.Custom${value.defCategory}`),
      hint: game.i18n.localize(`WOD6E.Settings.Custom${value.defCategory}Hint`),
      scope: 'world',
      config: false,
      default: [],
      type: Array,
      onChange: async (custom) => {
        // Re-render the storyteller menu window once settings are updated
        _rerenderStorytellerWindow()

        // Grab the custom attributes and send them to the function to update the list
        await value.defClass.addCustom(custom)

        // Re-init labels
        await value.defClass.initializeLabels()
      }
    })
  }

  // World Version, only really needed by developers
  game.settings.register('wod6e', 'worldVersion', {
    name: game.i18n.localize('WOD6E.SETTINGS.WorldVersion'),
    hint: game.i18n.localize('WOD6E.SETTINGS.WorldVersionHint'),
    scope: 'world',
    config: true,
    default: '1.0',
    type: String
  })
}

function _rerenderStorytellerWindow() {
  const storytellerWindow = Object.values(ui.windows).filter((w) => w.id === 'wod6e-storyteller')[0]

  if (storytellerWindow) {
    storytellerWindow.render()
  }
}
