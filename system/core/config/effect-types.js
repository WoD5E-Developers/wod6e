import { BaseDefinitionClass } from './base-definition-class.js'

export class EffectTypes extends BaseDefinitionClass {
  static modsEnabled = false
  static defCategory = 'EffectTypes'

  // Run any necessary compilation on ready
  static onReady() {
    EffectTypes.initializeLabels()
  }

  static none = {
    label: 'WOD6E.None'
  }

  static actorTrait = {
    label: 'WOD6E.CONDITIONS.ActorTrait',
    showTargets: true,
    showValueFields: true
  }

  static dice = {
    label: 'WOD6E.CONDITIONS.DicePool',
    showTargets: true,
    showValueFields: true,
    showPredicates: true,
    showExclusions: true
  }

  /** WIP
  static baseDifficulty = {
    label: 'WOD6E.CONDITIONS.BaseDifficulty'
  }

  static difficulty = {
    label: 'WOD6E.CONDITIONS.Difficulty'
  }

  static cost = {
    label: 'WOD6E.ITEMS.Cost'
  }

  static basicSuccess = {
    label: 'WOD6E.CONDITIONS.BasicSuccess'
  }

  static automaticSuccess = {
    label: 'WOD6E.CONDITIONS.AutomaticSuccess'
  }

  static automaticFailure = {
    label: 'WOD6E.CONDITIONS.AutomaticFailure'
  }

  static damage = {
    label: 'WOD6E.CONDITIONS.Damage'
  }

  static damageReduction = {
    label: 'WOD6E.CONDITIONS.DamageReduction'
  }

  static resource = {
    label: 'WOD6E.CONDITIONS.Resource'
  }

  static resourceMaximum = {
    label: 'WOD6E.CONDITIONS.ResourceMaximum'
  }
  */
}

// Hook to call onReady when the game is ready
Hooks.once('ready', EffectTypes.onReady)
