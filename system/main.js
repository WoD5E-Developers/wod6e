// Custom UI Classes
import { WoDSettings } from './core/ui/wod-settings.js'
import { WoDPause } from './core/ui/wod-game-pause.js'
// FVTT and module functionality
import { preloadHandlebarsTemplates } from './core/scripts/templates.js'
import { loadHelpers } from './core/scripts/helpers.js'
import { loadSettings } from './core/scripts/settings.js'
// Actor sheets
import { WoDActor } from './core/actors/actor.js'
import { WoDActorModel } from './core/actors/data-models/base-actor-model.js'
import { WoDActorBase } from './core/actors/actor-sheets/wod-actor-base.js'
// WOD6E Definitions
import { Systems } from './core/config/systems.js'
import { Attributes } from './core/config/attributes.js'
import { AttributeGroups } from './core/config/attributes-groups.js'
import { Skills } from './core/config/skills.js'
import { ActorTypes } from './core/config/actor-types.js'
import { ItemTypes } from './core/config/item-types.js'
import { StorytellerMenu } from './core/applications/storyteller-menu.js'

// Register the WOD6E global
window.WOD6E = {
  api: {},
  applications: {
    StorytellerMenu
  },
  WoDActorBase,
  WoDActorModel,
  Systems,
  Attributes,
  AttributeGroups,
  Skills
}

// Anything that needs to be ran alongside the initialisation of the world
Hooks.once('init', async function () {
  // Custom document classes
  CONFIG.Actor.documentClass = WoDActor
  // Custom UI implementations
  CONFIG.ui.settings = WoDSettings
  CONFIG.ui.pause = WoDPause

  // Loop through each entry in the actorTypesList and register their sheet classes
  const actorTypesList = ActorTypes.getList({})
  for (const [id, value] of Object.entries(actorTypesList)) {
    const { types, sheetClass, sheetModel } = value

    // Add to the list of data models
    Object.assign(CONFIG.Actor.dataModels, {
      [id]: sheetModel
    })

    // Register the sheet with Foundry's DocumentSheetConfig
    foundry.applications.apps.DocumentSheetConfig.registerSheet(Actor, 'wod6e', sheetClass, {
      types,
      makeDefault: true
    })
  }

  // Loop through each entry in the itemTypesList and register their sheet classes
  const itemTypesList = ItemTypes.getList({})
  for (const [id, value] of Object.entries(itemTypesList)) {
    const { types, sheetClass, sheetModel } = value

    // Add to the list of data models
    Object.assign(CONFIG.Item.dataModels, {
      [id]: sheetModel
    })

    // Register the sheet with Foundry's DocumentSheetConfig
    foundry.applications.apps.DocumentSheetConfig.registerSheet(Item, 'wod6e', sheetClass, {
      types,
      makeDefault: true
    })
  }

  // Make Handlebars templates accessible to the system
  preloadHandlebarsTemplates()

  // Make helpers accessible to the system
  loadHelpers()

  // Load settings into Foundry
  loadSettings()
})

// Anything that needs to run once the world is fully loaded
Hooks.once('ready', async function () {
  // Flavourtext
  console.log(
    game.i18n.format('WOD6E.NOTIFICATIONS.ConsoleLog', {
      string: game.i18n.localize('WOD6E.NOTIFICATIONS.InitializingSchreckNet')
    })
  )

  console.log(
    game.i18n.format('WOD6E.NOTIFICATIONS.ConsoleLog', {
      string: game.i18n.localize('WOD6E.NOTIFICATIONS.LoadingSubroutines')
    })
  )

  // Forced panning is intrinsically annoying: change default to false
  game.settings.settings.get('core.chatBubblesPan').default = false

  // Improve discoverability of map notes
  game.settings.settings.get('core.notesDisplayToggle').default = true

  // Apply the currently selected language as a CSS class so we can
  // modify elements based on locale if needed
  document.body.classList.add(game.settings.get('core', 'language'))

  // Flavourtext
  console.log(
    game.i18n.format('WOD6E.NOTIFICATIONS.ConsoleLog', {
      string: game.i18n.localize('WOD6E.NOTIFICATIONS.ShreckNetInitialized')
    })
  )
})

// Whenever an actor updates, we want to check for if the 'locked' variable changes
// and then we want to re-render the item as part of this since items can be
// in a read-only state (derived from the actor itself)
Hooks.on('updateActor', (actor, changes) => {
  // Check if the 'system.locked' property is changed
  if (!foundry.utils.hasProperty(changes, 'system.locked')) return

  // Re-render all item sheets with the actor as the parent
  const activeWindows = foundry.applications.api.ApplicationV2.instances()
  const activeActorItemWindows = [...activeWindows].filter((application) => {
    const item = application.document
    return application.rendered && item?.parent?.uuid === actor.uuid
  })
  for (const app of activeActorItemWindows) {
    app.render(false)
  }
})
