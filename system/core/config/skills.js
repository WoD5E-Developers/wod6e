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
    label: 'WOD6E.SkillsList.Athletics',
    type: 'physical'
  }

  static animalken = {
    label: 'WOD6E.SkillsList.AnimalKen',
    type: 'social'
  }

  static academics = {
    label: 'WOD6E.SkillsList.Academics',
    type: 'mental'
  }

  static brawl = {
    label: 'WOD6E.SkillsList.Brawl',
    type: 'physical'
  }

  static etiquette = {
    label: 'WOD6E.SkillsList.Etiquette',
    type: 'social'
  }

  static awareness = {
    label: 'WOD6E.SkillsList.Awareness',
    type: 'mental'
  }

  static craft = {
    label: 'WOD6E.SkillsList.Craft',
    type: 'physical'
  }

  static insight = {
    label: 'WOD6E.SkillsList.Insight',
    type: 'social'
  }

  static finance = {
    label: 'WOD6E.SkillsList.Finance',
    type: 'mental'
  }

  static drive = {
    label: 'WOD6E.SkillsList.Drive',
    type: 'physical'
  }

  static intimidation = {
    label: 'WOD6E.SkillsList.Intimidation',
    type: 'social'
  }

  static investigation = {
    label: 'WOD6E.SkillsList.Investigation',
    type: 'mental'
  }

  static firearms = {
    label: 'WOD6E.SkillsList.Firearms',
    type: 'physical'
  }

  static leadership = {
    label: 'WOD6E.SkillsList.Leadership',
    type: 'social'
  }

  static medicine = {
    label: 'WOD6E.SkillsList.Medicine',
    type: 'mental'
  }

  static larceny = {
    label: 'WOD6E.SkillsList.Larceny',
    type: 'physical'
  }

  static performance = {
    label: 'WOD6E.SkillsList.Performance',
    type: 'social'
  }

  static occult = {
    label: 'WOD6E.SkillsList.Occult',
    type: 'mental'
  }

  static melee = {
    label: 'WOD6E.SkillsList.Melee',
    type: 'physical'
  }

  static persuasion = {
    label: 'WOD6E.SkillsList.Persuasion',
    type: 'social'
  }

  static politics = {
    label: 'WOD6E.SkillsList.Politics',
    type: 'mental'
  }

  static stealth = {
    label: 'WOD6E.SkillsList.Stealth',
    type: 'physical'
  }

  static streetwise = {
    label: 'WOD6E.SkillsList.Streetwise',
    type: 'social'
  }

  static science = {
    label: 'WOD6E.SkillsList.Science',
    type: 'mental'
  }

  static survival = {
    label: 'WOD6E.SkillsList.Survival',
    type: 'physical'
  }

  static subterfuge = {
    label: 'WOD6E.SkillsList.Subterfuge',
    type: 'social'
  }

  static technology = {
    label: 'WOD6E.SkillsList.Technology',
    type: 'mental'
  }
}

// Hook to call onReady when the game is ready
Hooks.once('ready', Skills.onReady)
