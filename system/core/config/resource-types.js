import { BaseDefinitionClass } from './base-definition-class.js'

export class ResourceTypes extends BaseDefinitionClass {
  static modsEnabled = false
  static defCategory = 'ResourceTypes'

  // Run any necessary compilation on ready
  static onReady() {
    // Handle adding custom disciplines from the game settings
    let customResourceTypes = game.settings.get('wod6e', 'customResourceTypes') || {}

    // Handle adding custom disciplines from any active modules
    const activeModules = game.modules.filter(
      (module) => module.active === true && module.flags.wod6e
    )
    activeModules.forEach((module) => {
      if (module.flags.wod6e.customResourceTypes) {
        customResourceTypes = customResourceTypes.concat(module.flags.wod6e.customResourceTypes)

        // Log the custom data in the console
        console.log(
          `World of Darkness 6th Edition | Custom Resource Types added by ${module.id}: ${JSON.stringify(module.flags.wod6e.customResourceTypes)}`
        )
      }
    })

    if (customResourceTypes) {
      ResourceTypes.addCustom(customResourceTypes)
    }

    ResourceTypes.initializeLabels()
  }

  static socialAssets = {
    label: 'WOD6E.RESOURCES.SocialAssets'
  }

  static physicalAssets = {
    label: 'WOD6E.RESOURCES.PhysicalAssets'
  }

  static wealth = {
    label: 'WOD6E.RESOURCES.Wealth'
  }
}

// Hook to call onReady when the game is ready
Hooks.once('ready', ResourceTypes.onReady)
