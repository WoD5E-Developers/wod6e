import { BaseDefinitionClass } from './base-definition-class.js'

export class CostTypes extends BaseDefinitionClass {
  static modsEnabled = false
  static defCategory = 'CostTypes'

  // Run any necessary compilation on ready
  static onReady() {
    CostTypes.initializeLabels()
  }

  static none = {
    label: 'WOD6E.None'
  }

  static health = {
    label: 'WOD6E.RESOURCES.Vitae',
    resourcePath: 'health'
  }

  static willpower = {
    label: 'WOD6E.RESOURCES.Willpower',
    resourcePath: 'willpower'
  }
}

// Hook to call onReady when the game is ready
Hooks.once('ready', CostTypes.onReady)
