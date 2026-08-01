import { BaseDefinitionClass } from './base-definition-class.js'

export class AttributeGroups extends BaseDefinitionClass {
  static modsEnabled = false

  // Run any necessary compilation on ready
  static onReady() {
    AttributeGroups.initializeLabels()
  }

  static physical = {
    label: 'WOD6E.ATTRIBUTES.Physical'
  }

  static social = {
    label: 'WOD6E.ATTRIBUTES.Social'
  }

  static mental = {
    label: 'WOD6E.ATTRIBUTES.Mental'
  }
}

// Hook to call onReady when the game is ready
Hooks.once('ready', AttributeGroups.onReady)
