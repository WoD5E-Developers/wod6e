import { BaseDefinitionClass } from './base-definition-class.js'

export class ActionRoles extends BaseDefinitionClass {
  static modsEnabled = false
  static defCategory = 'ActionRoles'

  // Run any necessary compilation on ready
  static onReady() {
    // Handle adding custom disciplines from the game settings
    let customActionRoles = game.settings.get('wod6e', 'customActionRoles') || {}

    // Handle adding custom disciplines from any active modules
    const activeModules = game.modules.filter(
      (module) => module.active === true && module.flags.wod6e
    )
    activeModules.forEach((module) => {
      if (module.flags.wod6e.customActionRoles) {
        customActionRoles = customActionRoles.concat(module.flags.wod6e.customActionRoles)

        // Log the custom data in the console
        console.log(
          `World of Darkness 6th Edition | Custom Action Roles added by ${module.id}: ${JSON.stringify(module.flags.wod6e.customActionRoles)}`
        )
      }
    })

    if (customActionRoles) {
      ActionRoles.addCustom(customActionRoles)
    }

    ActionRoles.initializeLabels()
  }

  static attack = {
    label: 'WOD6E.ACTIONS.Attack'
  }

  static defense = {
    label: 'WOD6E.ACTIONS.Defense'
  }

  static utility = {
    label: 'WOD6E.ACTIONS.Utility'
  }

  static recovery = {
    label: 'WOD6E.ACTIONS.Recovery'
  }
}

// Hook to call onReady when the game is ready
Hooks.once('ready', ActionRoles.onReady)
