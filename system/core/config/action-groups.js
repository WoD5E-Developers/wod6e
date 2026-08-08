import { BaseDefinitionClass } from './base-definition-class.js'

export class ActionGroups extends BaseDefinitionClass {
  static modsEnabled = false
  static defCategory = 'ActionGroups'

  // Run any necessary compilation on ready
  static onReady() {
    // Handle adding custom disciplines from the game settings
    let customActionGroups = game.settings.get('wod6e', 'customActionGroups') || {}

    // Handle adding custom disciplines from any active modules
    const activeModules = game.modules.filter(
      (module) => module.active === true && module.flags.wod6e
    )
    activeModules.forEach((module) => {
      if (module.flags.wod6e.customActionGroups) {
        customActionGroups = customActionGroups.concat(module.flags.wod6e.customActionGroups)

        // Log the custom data in the console
        console.log(
          `World of Darkness 6th Edition | Custom Action Groups added by ${module.id}: ${JSON.stringify(module.flags.wod6e.customActionGroups)}`
        )
      }
    })

    if (customActionGroups) {
      ActionGroups.addCustom(customActionGroups)
    }

    ActionGroups.initializeLabels()
  }

  static general = {
    label: 'WOD6E.ACTIONS.General'
  }

  static physical = {
    label: 'WOD6E.ACTIONS.Physical'
  }

  static social = {
    label: 'WOD6E.ACTIONS.Social'
  }

  static exploration = {
    label: 'WOD6E.ACTIONS.Exploration'
  }

  static downtime = {
    label: 'WOD6E.ACTIONS.Downtime'
  }
}

// Hook to call onReady when the game is ready
Hooks.once('ready', ActionGroups.onReady)
