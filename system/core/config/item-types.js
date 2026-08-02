// Definition classes

// Item models and sheets
import { Disciplines } from '../../splats/vampire/config/disciplines.js'
import { DisciplineItemModel } from '../../splats/vampire/items/data-models/discipline-item-model.js'
import { DisciplineItemSheet } from '../../splats/vampire/items/item-sheets/discipline-item-sheet.js'
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
    img: 'systems/wod6e/assets/icons/items/resource.svg',
    types: ['resource'],
    sheetClass: ResourceItemSheet,
    sheetModel: ResourceItemModel,
    splat: 'core',
    subtypes: ResourceTypes,
    subtypePath: 'resourceType'
  }

  static discipline = {
    label: 'TYPES.Item.discipline',
    img: 'systems/wod6e/assets/icons/items/discipline.svg',
    types: ['discipline'],
    sheetClass: DisciplineItemSheet,
    sheetModel: DisciplineItemModel,
    splat: 'core',
    subtypes: Disciplines,
    subtypePath: 'disciplineType'
  }
}

// Hook to call onReady when the game is ready
Hooks.once('ready', ItemTypes.onReady)
