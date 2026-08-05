// Definition classes

// Item models and sheets
import { BaseDefinitionClass } from './base-definition-class.js'
// Resource
import { ResourceTypes } from './resource-types.js'
import { ResourceItemModel } from '../items/data-models/resource-item-model.js'
import { ResourceItemSheet } from '../items/item-sheets/resource-item-sheet.js'
// Clan
import { ClanItemModel } from '../../splats/vampire/items/data-models/clan-item-model.js'
import { ClanItemSheet } from '../../splats/vampire/items/item-sheets/clan-item-sheet.js'
// Discipline
import { Disciplines } from '../../splats/vampire/config/disciplines.js'
import { DisciplineItemModel } from '../../splats/vampire/items/data-models/discipline-item-model.js'
import { DisciplineItemSheet } from '../../splats/vampire/items/item-sheets/discipline-item-sheet.js'
import { ClanTraitItemSheet } from '../../splats/vampire/items/item-sheets/clan-trait-item-sheet.js'
import { ClanTraitItemModel } from '../../splats/vampire/items/data-models/clan-trait-item-model.js'

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

  static clan = {
    label: 'TYPES.Item.clan',
    img: '',
    types: ['clan'],
    sheetClass: ClanItemSheet,
    sheetModel: ClanItemModel,
    restrictedActorTypes: ['vampire'],
    limitOnePerActor: true,
    splat: 'vampire'
  }

  static clanTrait = {
    label: 'TYPES.Item.clanTrait',
    img: '',
    types: ['clanTrait'],
    sheetClass: ClanTraitItemSheet,
    sheetModel: ClanTraitItemModel,
    restrictedActorTypes: ['vampire'],
    splat: 'vampire'
  }

  static discipline = {
    label: 'TYPES.Item.discipline',
    img: 'systems/wod6e/assets/icons/items/discipline.svg',
    types: ['discipline'],
    sheetClass: DisciplineItemSheet,
    sheetModel: DisciplineItemModel,
    splat: 'vampire',
    subtypes: Disciplines,
    subtypePath: 'disciplineType'
  }
}

// Hook to call onReady when the game is ready
Hooks.once('ready', ItemTypes.onReady)
