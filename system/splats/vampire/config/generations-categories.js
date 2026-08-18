import { BaseDefinitionClass } from '../../../core/config/base-definition-class.js'

export class GenerationCategories extends BaseDefinitionClass {
  static modsEnabled = false
  static type = 'generationCategories'
  static defCategory = 'GenerationCategories'

  // Run any necessary compilation on ready
  static onReady() {
    GenerationCategories.initializeLabels()
    GenerationCategories.initializePaths()
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
        value.path = `system.vampire.generation.modifier.${key}`
      }
    }
  }

  static duskborn = {
    label: 'WOD6E.VAMPIRE.Duskborn',
    modifier: 1,
    generations: [14, 15, 16]
  }

  static neonate = {
    label: 'WOD6E.VAMPIRE.Neonate',
    modifier: 1,
    generations: [11, 12, 13]
  }

  static ancilla = {
    label: 'WOD6E.VAMPIRE.Ancilla',
    modifier: 2,
    generations: [9, 10]
  }

  static elder = {
    label: 'WOD6E.VAMPIRE.Elder',
    modifier: 3,
    generations: [6, 7, 8]
  }

  static methuselah = {
    label: 'WOD6E.VAMPIRE.Methuselah',
    modifier: 4,
    generations: [4, 5]
  }
}

// Hook to call onReady when the game is ready
Hooks.once('ready', GenerationCategories.onReady)
