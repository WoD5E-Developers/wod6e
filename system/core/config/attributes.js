import { BaseDefinitionClass } from './base-definition-class.js'

export class Attributes extends BaseDefinitionClass {
  static modsEnabled = true
  static type = 'attributes'
  static defCategory = 'Attributes'

  // Run any necessary compilation on ready
  static onReady() {
    // Handle adding custom disciplines from the game settings
    let customAttributes = game.settings.get('wod6e', 'customAttributes') || {}

    // Handle adding custom disciplines from any active modules
    const activeModules = game.modules.filter(
      (module) => module.active === true && module.flags.wod6e
    )
    activeModules.forEach((module) => {
      if (module.flags.wod6e.customAttributes) {
        customAttributes = customAttributes.concat(module.flags.wod6e.customAttributes)

        // Log the custom data in the console
        console.log(
          `World of Darkness 6th Edition | Custom Attributes added by ${module.id}: ${JSON.stringify(module.flags.wod6e.customAttributes)}`
        )
      }
    })

    if (customAttributes) {
      Attributes.addCustom(customAttributes)
    }

    Attributes.initializeLabels()
    Attributes.initializePaths()
  }

  static initializePaths() {
    // Cycle through each entry in the definition file to initialize the paths on each
    // Quickly filter out any non-object, non-null, non-array values
    const definitionEntries = Object.entries(this).filter(
      ([, value]) => typeof value === 'object' && value !== null && !Array.isArray(value)
    )
    for (const [key, value] of definitionEntries) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Set the path
        value.path = `system.attributes.${key}.value`
      }
    }
  }

  static strength = {
    label: 'WOD6E.AttributesList.Strength',
    type: 'physical'
  }

  static dexterity = {
    label: 'WOD6E.AttributesList.Dexterity',
    type: 'physical'
  }

  static stamina = {
    label: 'WOD6E.AttributesList.Stamina',
    type: 'physical'
  }

  static charisma = {
    label: 'WOD6E.AttributesList.Charisma',
    type: 'social'
  }

  static manipulation = {
    label: 'WOD6E.AttributesList.Manipulation',
    type: 'social'
  }

  static composure = {
    label: 'WOD6E.AttributesList.Composure',
    type: 'social'
  }

  static intelligence = {
    label: 'WOD6E.AttributesList.Intelligence',
    type: 'mental'
  }

  static wits = {
    label: 'WOD6E.AttributesList.Wits',
    type: 'mental'
  }

  static resolve = {
    label: 'WOD6E.AttributesList.Resolve',
    type: 'mental'
  }
}

// Hook to call onReady when the game is ready
Hooks.once('ready', Attributes.onReady)
