// Base definition class
import { ResourceItemModel } from '../items/data-models/resource-item-model.js'
import { ResourceItemSheet } from '../items/item-sheets/resource-item-sheet.js'
import { BaseDefinitionClass } from './base-definition-class.js'
import { ResourceTypes } from './resource-types.js'

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

  static resource = {
    label: 'TYPES.Item.resource',
    img: 'systems/wod6e/assets/icons/items/feature.svg',
    types: ['resource'],
    sheetClass: ResourceItemSheet,
    sheetModel: ResourceItemModel,
    splat: 'core',
    subtypes: ResourceTypes,
    subtypePath: 'resourceType'
  }
}

// Hook to call onReady when the game is ready
Hooks.once('ready', ItemTypes.onReady)
