import { BaseDefinitionClass } from './base-definition-class.js'

export class ActionDifficulties extends BaseDefinitionClass {
  static modsEnabled = false
  static defCategory = 'ActionDifficulties'

  // Run any necessary compilation on ready
  static onReady() {
    // Handle adding custom disciplines from the game settings
    let customActionDifficulties = game.settings.get('wod6e', 'customActionDifficulties') || {}

    // Handle adding custom disciplines from any active modules
    const activeModules = game.modules.filter(
      (module) => module.active === true && module.flags.wod6e
    )
    activeModules.forEach((module) => {
      if (module.flags.wod6e.customActionDifficulties) {
        customActionDifficulties = customActionDifficulties.concat(
          module.flags.wod6e.customActionDifficulties
        )

        // Log the custom data in the console
        console.log(
          `World of Darkness 6th Edition | Custom Action Difficulties added by ${module.id}: ${JSON.stringify(module.flags.wod6e.customActionDifficulties)}`
        )
      }
    })

    if (customActionDifficulties) {
      ActionDifficulties.addCustom(customActionDifficulties)
    }

    ActionDifficulties.initializeLabels()
  }

  static none = {
    label: 'WOD6E.None'
  }

  static fixed = {
    label: 'WOD6E.ACTIONS.Fixed',
    usesFixedValue: true
  }

  static storyteller = {
    label: 'WOD6E.ACTIONS.Storyteller'
  }

  static variable = {
    label: 'WOD6E.ACTIONS.Variable'
  }

  static targetAttribute = {
    label: 'WOD6E.ACTIONS.TargetAttribute',
    usesAttribute: true
  }

  static targetHighestAttribute = {
    label: 'WOD6E.ACTIONS.TargetHighestAttribute',
    usesAttribute: true
  }

  static npcLevel = {
    label: 'WOD6E.ACTIONS.NPCLevel'
  }

  static attributeOrNpcLevel = {
    label: 'WOD6E.ACTIONS.AttributeOrNPCLevel',
    usesAttribute: true,
    usesNpcLevel: true
  }
}

// Hook to call onReady when the game is ready
Hooks.once('ready', ActionDifficulties.onReady)
