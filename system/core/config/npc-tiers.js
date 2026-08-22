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
    levels: ['value'],
    showHealth: false,
    showWillpower: false
  }

  static standard = {
    label: 'WOD6E.NPC.Standard',
    levels: ['value'],
    showHealth: true,
    showWillpower: true,
    healthLevels: ['value'],
    healthMultiplier: 3,
    willpowerLevels: ['value'],
    willpowerMultiplier: 3
  }

  static elite = {
    label: 'WOD6E.NPC.Elite',
    levels: ['physical', 'social', 'mental'],
    showHealth: true,
    showWillpower: true,
    healthLevels: ['physical'],
    healthMultiplier: 5,
    willpowerLevels: ['social', 'mental'],
    willpowerMultiplier: 5
  }
}

// Hook to call onReady when the game is ready
Hooks.once('ready', NpcTiers.onReady)
