import { BaseDefinitionClass } from './base-definition-class.js'

export class NpcTiers extends BaseDefinitionClass {
  static modsEnabled = false
  static defCategory = 'NpcTypes'

  // Run any necessary compilation on ready
  static onReady() {
    NpcTiers.initializeLabels()
  }

  static minion = {
    label: 'WOD6E.NPC.Minion',
    usesDetailedTraits: false
  }

  static minor = {
    label: 'WOD6E.NPC.Minor',
    usesDetailedTraits: false
  }

  static standard = {
    label: 'WOD6E.NPC.Standard',
    usesDetailedTraits: false
  }

  static major = {
    label: 'WOD6E.NPC.Major',
    usesDetailedTraits: true
  }

  static getDefinition(tier) {
    return this.getList({ disableSort: true })[tier] ?? this.standard
  }
}

// Hook to call onReady when the game is ready
Hooks.once('ready', NpcTiers.onReady)
