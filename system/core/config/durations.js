import { BaseDefinitionClass } from './base-definition-class.js'

export class Durations extends BaseDefinitionClass {
  static modsEnabled = false
  static defCategory = 'Durations'

  // Run any necessary compilation on ready
  static onReady() {
    // Handle adding custom disciplines from the game settings
    let customDurations = game.settings.get('wod6e', 'customDurations') || {}

    // Handle adding custom disciplines from any active modules
    const activeModules = game.modules.filter(
      (module) => module.active === true && module.flags.wod6e
    )
    activeModules.forEach((module) => {
      if (module.flags.wod6e.customDurations) {
        customDurations = customDurations.concat(module.flags.wod6e.customDurations)

        // Log the custom data in the console
        console.log(
          `World of Darkness 6th Edition | Custom Difficulties added by ${module.id}: ${JSON.stringify(module.flags.wod6e.customDurations)}`
        )
      }
    })

    if (customDurations) {
      Durations.addCustom(customDurations)
    }

    Durations.initializeLabels()
  }

  static none = {
    label: 'WOD6E.None'
  }

  static instantaneous = {
    label: 'WOD6E.ACTIONS.Instantaneous'
  }

  static turn = {
    label: 'WOD6E.ACTIONS.OneTurn'
  }

  static scene = {
    label: 'WOD6E.ACTIONS.OneScene'
  }

  static night = {
    label: 'WOD6E.ACTIONS.OneNight'
  }

  static permanent = {
    label: 'WOD6E.ACTIONS.Permanent'
  }

  static special = {
    label: 'WOD6E.ACTIONS.Special'
  }

  static maintained = {
    label: 'WOD6E.ACTIONS.Maintained'
  }
}

// Hook to call onReady when the game is ready
Hooks.once('ready', Durations.onReady)
