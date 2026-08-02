import { BaseDefinitionClass } from '../../../core/config/base-definition-class.js'

export class Disciplines extends BaseDefinitionClass {
  static modsEnabled = true
  static type = 'disciplines'
  static defCategory = 'Disciplines'

  // Run any necessary compilation on ready
  static onReady() {
    // Handle adding custom disciplines from the game settings
    let customDisciplines = game.settings.get('wod6e', 'customDisciplines') || {}

    // Handle adding custom disciplines from any active modules
    const activeModules = game.modules.filter(
      (module) => module.active === true && module.flags.wod6e
    )
    activeModules.forEach((module) => {
      if (module.flags.wod6e.customDisciplines) {
        customDisciplines = customDisciplines.concat(module.flags.wod6e.customDisciplines)

        // Log the custom data in the console
        console.log(
          `World of Darkness 6th Edition | Custom Disciplines added by ${module.id}: ${JSON.stringify(module.flags.wod6e.customDisciplines)}`
        )
      }
    })

    if (customDisciplines) {
      Disciplines.addCustom(customDisciplines)
    }

    Disciplines.initializeLabels()
    Disciplines.initializePaths()
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
        value.path = `system.disciplines.${key}.value`
      }
    }
  }

  static animalism = {
    label: 'WOD6E.VAMPIRE.Animalism'
  }

  static auspex = {
    label: 'WOD6E.VAMPIRE.Auspex'
  }

  static bloodSorcery = {
    label: 'WOD6E.VAMPIRE.BloodSorcery'
  }

  static celerity = {
    label: 'WOD6E.VAMPIRE.Celerity'
  }

  static corruption = {
    label: 'WOD6E.VAMPIRE.Corruption'
  }

  static dominate = {
    label: 'WOD6E.VAMPIRE.Dominate'
  }

  static fortitude = {
    label: 'WOD6E.VAMPIRE.Fortitude'
  }

  static necromancy = {
    label: 'WOD6E.VAMPIRE.Necromancy'
  }

  static obfuscate = {
    label: 'WOD6E.VAMPIRE.Obfuscate'
  }

  static oblivion = {
    label: 'WOD6E.VAMPIRE.Oblivion'
  }

  static potence = {
    label: 'WOD6E.VAMPIRE.Potence'
  }

  static presence = {
    label: 'WOD6E.VAMPIRE.Presence'
  }

  static tellurgy = {
    label: 'WOD6E.VAMPIRE.Tellurgy'
  }

  static vicissitude = {
    label: 'WOD6E.VAMPIRE.Vicissitude'
  }
}

// Hook to call onReady when the game is ready
Hooks.once('ready', Disciplines.onReady)
