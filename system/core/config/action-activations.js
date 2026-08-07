import { BaseDefinitionClass } from './base-definition-class.js'

export class ActionActivations extends BaseDefinitionClass {
  static modsEnabled = false
  static defCategory = 'ActionActivations'

  // Run any necessary compilation on ready
  static onReady() {
    // Handle adding custom disciplines from the game settings
    let customActionActivations = game.settings.get('wod6e', 'customActionActivations') || {}

    // Handle adding custom disciplines from any active modules
    const activeModules = game.modules.filter(
      (module) => module.active === true && module.flags.wod6e
    )
    activeModules.forEach((module) => {
      if (module.flags.wod6e.customActionActivations) {
        customActionActivations = customActionActivations.concat(
          module.flags.wod6e.customActionActivations
        )

        // Log the custom data in the console
        console.log(
          `World of Darkness 6th Edition | Custom Action Activations added by ${module.id}: ${JSON.stringify(module.flags.wod6e.customActionActivations)}`
        )
      }
    })

    if (customActionActivations) {
      ActionActivations.addCustom(customActionActivations)
    }

    ActionActivations.initializeLabels()
  }

  static action = {
    label: 'WOD6E.ACTIONS.Action'
  }

  static minorAction = {
    label: 'WOD6E.ACTIONS.MinorAction'
  }

  static reaction = {
    label: 'WOD6E.ACTIONS.Reaction'
  }

  static prolonged = {
    label: 'WOD6E.ACTIONS.Prolonged'
  }

  static downtime = {
    label: 'WOD6E.ACTIONS.Downtime'
  }
}

// Hook to call onReady when the game is ready
Hooks.once('ready', ActionActivations.onReady)
