import { BaseDefinitionClass } from './base-definition-class.js'

export class Activations extends BaseDefinitionClass {
  static modsEnabled = false
  static defCategory = 'Activations'

  // Run any necessary compilation on ready
  static onReady() {
    // Handle adding custom disciplines from the game settings
    let customActivations = game.settings.get('wod6e', 'customActivations') || {}

    // Handle adding custom disciplines from any active modules
    const activeModules = game.modules.filter(
      (module) => module.active === true && module.flags.wod6e
    )
    activeModules.forEach((module) => {
      if (module.flags.wod6e.customActivations) {
        customActivations = customActivations.concat(module.flags.wod6e.customActivations)

        // Log the custom data in the console
        console.log(
          `World of Darkness 6th Edition | Custom Activations added by ${module.id}: ${JSON.stringify(module.flags.wod6e.customActivations)}`
        )
      }
    })

    if (customActivations) {
      Activations.addCustom(customActivations)
    }

    Activations.initializeLabels()
  }

  static none = {
    label: 'WOD6E.None'
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
Hooks.once('ready', Activations.onReady)
