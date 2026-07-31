import { BaseDefinitionClass } from './base-definition-class.js'

export class Systems extends BaseDefinitionClass {
  // Run any necessary compilation on ready
  static onReady() {
    // Handle adding custom disciplines from any active modules
    const activeModules = game.modules.filter(
      (module) => module.active === true && module.flags.wod6e
    )
    let customSystems = []
    activeModules.forEach((module) => {
      if (module.flags.wod6e.customSystems) {
        customSystems = customSystems.concat(module.flags.wod6e.customSystems)

        // Log the custom data in the console
        console.log(
          `World of Darkness 6th Edition | Custom Systems added by ${module.id}: ${JSON.stringify(module.flags.wod6e.customSystems)}`
        )
      }
    })

    if (customSystems) {
      Systems.addCustom(customSystems)
    }

    Systems.initializeLabels()
  }

  static core = {
    label: 'WOD6E.Core'
  }

  static vampire = {
    label: 'TYPES.Actor.vampire'
  }
}

// Hook to call onReady when the game is ready
Hooks.once('ready', Systems.onReady)
