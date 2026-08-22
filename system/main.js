// Custom UI Classes
import { WoDSettings } from './core/ui/wod-settings.js'
import { WoDPause } from './core/ui/wod-game-pause.js'
// FVTT and module functionality
import { preloadHandlebarsTemplates } from './core/scripts/templates.js'
import { loadHelpers } from './core/scripts/helpers.js'
import { loadSettings } from './core/scripts/settings.js'
// Actor sheets
import { WoDActor } from './core/actors/actor.js'
import { WoDPlayerActorModel } from './core/actors/data-models/wod-player-actor-model.js'
import { WoDActorBase } from './core/actors/actor-sheets/wod-actor-base.js'
import { ActorUX } from './core/actors/scripts/actor-ux.js'
// Item sheets
import { WoDItemBase } from './core/items/item-sheets/wod-item-base.js'
import { WoDItemModel } from './core/items/data-models/base-item-model.js'
// Applications
import { StorytellerMenu } from './core/applications/storyteller-menu.js'
// WOD6E Definitions
import { Systems } from './core/config/systems.js'
import { Attributes } from './core/config/attributes.js'
import { AttributeGroups } from './core/config/attributes-groups.js'
import { Skills } from './core/config/skills.js'
import { ActorTypes } from './core/config/actor-types.js'
import { NpcTiers } from './core/config/npc-tiers.js'
import { ItemTypes } from './core/config/item-types.js'
import { ResourceTypes } from './core/config/resource-types.js'
import { Disciplines } from './splats/vampire/config/disciplines.js'
import {
  prepareDescriptionContext,
  prepareItemSettingsContext
} from './core/items/scripts/prepare-partials.js'
import {
  prepareAttributesContext,
  prepareLimitedContext,
  prepareResourcesContext,
  prepareSettingsContext
} from './core/actors/scripts/prepare-core-partials.js'
import { BaseDefinitionClass } from './core/config/base-definition-class.js'
import { loadControls } from './core/scripts/controls.js'
import { WoDCompendiumDirectory } from './core/ui/wod-compendium.js'
import { ActionGroups } from './core/config/action-groups.js'
import { Activations } from './core/config/activation-types.js'
import { ActionRoles } from './core/config/action-roles.js'
import { Difficulties } from './core/config/difficulties.js'
import { Distances } from './core/config/distances.js'
import { Durations } from './core/config/durations.js'
import { WOD6eRoll } from './core/scripts/wod6e-roll.js'
import { QuickeningDramaTrackerApplication } from './core/applications/quickening-drama-tracker/quickening-drama-tracker.js'
import { CostTypes } from './core/config/cost-types.js'
import { EffectTypes } from './core/config/effect-types.js'
import { GenerationCategories } from './splats/vampire/config/generations-categories.js'
import { WoDChatLog } from './core/ui/wod-chat-log.js'

// Register the WOD6E global
window.WOD6E = {
  api: {},
  applications: {
    StorytellerMenu
  },
  configs: {
    BaseDefinitionClass,
    Systems,
    Attributes,
    AttributeGroups,
    Skills,
    ResourceTypes,
    Disciplines,
    ItemTypes,
    ActorTypes,
    NpcTiers,
    ActionGroups,
    Activations,
    ActionRoles,
    Difficulties,
    Distances,
    Durations,
    CostTypes,
    EffectTypes,
    GenerationCategories
  },
  actors: {
    WoDActorBase,
    WoDPlayerActorModel,
    contextPreparation: {
      prepareAttributesContext,
      prepareResourcesContext,
      prepareSettingsContext,
      prepareLimitedContext
    }
  },
  items: {
    WoDItemBase,
    WoDItemModel,
    contextPreparation: {
      prepareDescriptionContext,
      prepareItemSettingsContext
    }
  }
}

// Allow sidebar items to be dropped directly onto actor tokens.
Hooks.on('dropCanvasData', ActorUX._onDropCanvasItem.bind(ActorUX))

// Anything that needs to be ran alongside the initialisation of the world
Hooks.once('init', async function () {
  // Custom document classes
  CONFIG.Actor.documentClass = WoDActor
  CONFIG.Dice.rolls.push(WOD6eRoll)
  // Custom UI implementations
  CONFIG.ui.chat = WoDChatLog
  CONFIG.ui.settings = WoDSettings
  CONFIG.ui.compendium = WoDCompendiumDirectory
  CONFIG.ui.pause = WoDPause
  window.WOD6E.applications.quickeningDramaTracker = null

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

  // Load keybindings
  loadControls()
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

  // Start the Quickening/Drama Tracker and show it
  window.WOD6E.applications.quickeningDramaTracker = new QuickeningDramaTrackerApplication()
  if (game.user.isGM || game.user.character) {
    window.WOD6E.applications.quickeningDramaTracker.render({
      force: true
    })
  }

  // Flavourtext
  console.log(
    game.i18n.format('WOD6E.NOTIFICATIONS.ConsoleLog', {
      string: game.i18n.localize('WOD6E.NOTIFICATIONS.ShreckNetInitialized')
    })
  )
})
