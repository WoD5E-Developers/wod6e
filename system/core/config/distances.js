import { BaseDefinitionClass } from './base-definition-class.js'

export class Distances extends BaseDefinitionClass {
  static modsEnabled = false
  static defCategory = 'Distances'

  // Run any necessary compilation on ready
  static onReady() {
    // Handle adding custom disciplines from the game settings
    let customDistances = game.settings.get('wod6e', 'customDistances') || {}

    // Handle adding custom disciplines from any active modules
    const activeModules = game.modules.filter(
      (module) => module.active === true && module.flags.wod6e
    )
    activeModules.forEach((module) => {
      if (module.flags.wod6e.customDistances) {
        customDistances = customDistances.concat(module.flags.wod6e.customDistances)

        // Log the custom data in the console
        console.log(
          `World of Darkness 6th Edition | Custom Action Distances added by ${module.id}: ${JSON.stringify(module.flags.wod6e.customDistances)}`
        )
      }
    })

    if (customDistances) {
      Distances.addCustom(customDistances)
    }

    Distances.initializeLabels()
  }

  static none = {
    label: 'WOD6E.None'
  }

  static self = {
    label: 'WOD6E.ACTIONS.Self'
  }

  static touch = {
    label: 'WOD6E.ACTIONS.Touch'
  }

  static close = {
    label: 'WOD6E.ACTIONS.Close'
  }

  static short = {
    label: 'WOD6E.ACTIONS.Short'
  }

  static far = {
    label: 'WOD6E.ACTIONS.Far'
  }

  static unlimited = {
    label: 'WOD6E.ACTIONS.Unlimited'
  }

  static special = {
    label: 'WOD6E.ACTIONS.Special'
  }
}

// Hook to call onReady when the game is ready
Hooks.once('ready', Distances.onReady)
