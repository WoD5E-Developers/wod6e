// Base definition class
import { BaseDefinitionClass } from './base-definition-class.js'

/*
 *   Each item type is defined through here; this includes the item's label,
 *   id ('types'), class, restricted actor types (a whitelist), and excluded
 *   actor types (a blacklist.)
 *
 *   As of 5.4.0, this also includes the 'splat' (core, vampire, werewolf, hunter)
 *   to assist with compendium browser filtering
 *
 *   The "limitOnePerActor" property also enforces if an actor isn't supposed
 *   to have more than one of that item, and it'll make the actor sheet delete
 *   the old version of an item from the actor upon being added.
 */

export class ItemTypes extends BaseDefinitionClass {
  // Run any necessary compilation on ready
  static onReady() {
    ItemTypes.initializeLabels()
  }
}

// Hook to call onReady when the game is ready
Hooks.once('ready', ItemTypes.onReady)
