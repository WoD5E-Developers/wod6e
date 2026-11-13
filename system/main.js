// Custom UI Classes
import { WoDSettings } from './core/ui/wod-settings.js'
import { WoDPause } from './core/ui/wod-game-pause.js'
import { WoDActorDirectory } from './core/ui/wod-actor-directory.js'
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
import { GroupTypes } from './core/config/group-types.js'
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
  prepareBiographyContext,
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
import { CostTypes } from './core/config/cost-types.js'
import { EffectTypes } from './core/config/effect-types.js'
import { GenerationCategories } from './splats/vampire/config/generations-categories.js'
import { CoterieTypes } from './splats/vampire/config/coterie-types.js'
import { WoDChatLog } from './core/ui/wod-chat-log.js'
import { initializeHumanityPaths } from './splats/vampire/scripts/humanity.js'
import { createPathItemData } from './splats/vampire/scripts/paths.js'
import { mountChronicleBar, registerChronicleSettings } from './core/ui/chronicle-bar.js'
import { initializeChronicleTime } from './core/scripts/chronicle.js'
import { migrateNpcStatBlocks } from './core/actors/scripts/migrate-npc-stat-blocks.js'
import { obsoleteItemsSetting, removeObsoleteItems } from './core/scripts/obsolete-items.js'

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
    GroupTypes,
    NpcTiers,
    ActionGroups,
    Activations,
    ActionRoles,
    Difficulties,
    Distances,
    Durations,
    CostTypes,
    EffectTypes,
    GenerationCategories,
    CoterieTypes
  },
  actors: {
    WoDActorBase,
    WoDPlayerActorModel,
    contextPreparation: {
      prepareAttributesContext,
      prepareBiographyContext,
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
  registerChronicleSettings()
  game.settings.register('wod6e', obsoleteItemsSetting, {
    scope: 'world',
    config: false,
    type: Boolean,
    default: false
  })

  Hooks.on('preCreateItem', (document, data) => {
    if (data.type !== 'path' || !document.parent?.items) return
    if (document.parent.items.some((item) => item.type === 'path' && item.id !== document.id)) {
      ui.notifications.warn(game.i18n.localize('WOD6E.VAMPIRE.OnePathOnly'))
      return false
    }
    if (foundry.utils.isEmpty(data.system ?? {})) {
      const { img, system, flags } = createPathItemData()
      document.updateSource({ img: data.img ?? img, system, flags })
    }
  })

  // Custom document classes
  CONFIG.Actor.documentClass = WoDActor
  CONFIG.Dice.rolls.push(WOD6eRoll)
  // Custom UI implementations
  CONFIG.ui.actors = WoDActorDirectory
  CONFIG.ui.chat = WoDChatLog
  CONFIG.ui.settings = WoDSettings
  CONFIG.ui.compendium = WoDCompendiumDirectory
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

  // Load keybindings
  loadControls()
})

// Anything that needs to run once the world is fully loaded
Hooks.once('ready', async function () {
  void initializeChronicleTime()
    .catch((error) => console.error('WOD6E | Chronicle time initialization', error))
    .then(mountChronicleBar)
    .catch((error) => console.error('WOD6E | Chronicle bar', error))
  try {
    await removeObsoleteItems()
  } catch (error) {
    console.error('WOD6E | Retired item migration failed', error)
    ui.notifications.error(game.i18n.localize('WOD6E.NOTIFICATIONS.ObsoleteItemsMigrationFailed'))
  }

  await migrateNpcStatBlocks().catch((error) =>
    console.error('WOD6E | NPC stat block migration', error)
  )
  await initializeHumanityPaths()

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
