// Base definition class
import { BaseDefinitionClass } from './base-definition-class.js'
// Vampire system
import { VampireActorSheet } from '../../splats/vampire/actors/actor-sheets/vampire-actor-sheet.js'
// Actor models
import { WoDPlayerActorModel } from '../actors/data-models/wod-player-actor-model.js'

export class ActorTypes extends BaseDefinitionClass {
  // Run any necessary compilation on ready
  static onReady() {
    ActorTypes.initializeLabels()
  }

  static vampire = {
    label: 'TYPES.Actor.vampire',
    types: ['vampire'],
    sheetClass: VampireActorSheet,
    sheetModel: WoDPlayerActorModel
  }
}

// Hook to call onReady when the game is ready
Hooks.once('ready', ActorTypes.onReady)
