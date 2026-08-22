// Base definition class
import { BaseDefinitionClass } from './base-definition-class.js'
// Player actor classes
import { WoDPlayerActorModel } from '../actors/data-models/wod-player-actor-model.js'
import { VampireActorSheet } from '../../splats/vampire/actors/actor-sheets/vampire-actor-sheet.js'
// NPC actor classes
import { NpcActorSheet } from '../actors/actor-sheets/npc-actor-sheet.js'
import { WoDNpcActorModel } from '../actors/data-models/wod-npc-actor-model.js'

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

  static npc = {
    label: 'TYPES.Actor.npc',
    types: ['npc'],
    sheetClass: NpcActorSheet,
    sheetModel: WoDNpcActorModel
  }
}

// Hook to call onReady when the game is ready
Hooks.once('ready', ActorTypes.onReady)
