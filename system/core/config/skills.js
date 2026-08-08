import { BaseDefinitionClass } from './base-definition-class.js'

export class Skills extends BaseDefinitionClass {
  static modsEnabled = true
  static type = 'skills'
  static defCategory = 'Skills'

  // Run any necessary compilation on ready
  static onReady() {
    // Handle adding custom disciplines from the game settings
    let customSkills = game.settings.get('wod6e', 'customSkills') || {}

    // Handle adding custom disciplines from any active modules
    const activeModules = game.modules.filter(
      (module) => module.active === true && module.flags.wod6e
    )
    activeModules.forEach((module) => {
      if (module.flags.wod6e.customSkills) {
        customSkills = customSkills.concat(module.flags.wod6e.customSkills)

        // Log the custom data in the console
        console.log(
          `World of Darkness 6th Edition | Custom Skills added by ${module.id}: ${JSON.stringify(module.flags.wod6e.customSkills)}`
        )
      }
    })

    if (customSkills) {
      Skills.addCustom(customSkills)
    }

    Skills.initializeLabels()
    Skills.initializePaths()
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
        value.path = `system.skills.${key}.value`
      }
    }
  }

  static athletics = {
    label: 'WOD6E.SKILLS.Athletics'
  }

  static awareness = {
    label: 'WOD6E.SKILLS.Awareness'
  }

  static craft = {
    label: 'WOD6E.SKILLS.Craft'
  }

  static expression = {
    label: 'WOD6E.SKILLS.Expression'
  }

  static fighting = {
    label: 'WOD6E.SKILLS.Fighting'
  }

  static investigation = {
    label: 'WOD6E.SKILLS.Investigation'
  }

  static knowledge = {
    label: 'WOD6E.SKILLS.Knowledge'
  }

  static medicine = {
    label: 'WOD6E.SKILLS.Medicine'
  }

  static persuasion = {
    label: 'WOD6E.SKILLS.Persuasion'
  }

  static shooting = {
    label: 'WOD6E.SKILLS.Shooting'
  }

  static sabotage = {
    label: 'WOD6E.SKILLS.Sabotage'
  }

  static subterfuge = {
    label: 'WOD6E.SKILLS.Subterfuge'
  }

  static survival = {
    label: 'WOD6E.SKILLS.Survival'
  }
}

// Hook to call onReady when the game is ready
Hooks.once('ready', Skills.onReady)
