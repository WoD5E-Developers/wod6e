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
// Clan Trait
import { ClanTraitItemSheet } from '../../splats/vampire/items/item-sheets/clan-trait-item-sheet.js'
import { ClanTraitItemModel } from '../../splats/vampire/items/data-models/clan-trait-item-model.js'
// Action
import { ActionItemSheet } from '../items/item-sheets/action-item-sheet.js'
import { ActionItemModel } from '../items/data-models/action-item-model.js'
import { ActionGroups } from './action-groups.js'
// Equipment
import { EquipmentItemSheet } from '../items/item-sheets/equipment-item-sheet.js'
import { EquipmentItemModel } from '../items/data-models/equipment-item-model.js'
// Flaw
import { FlawItemSheet } from '../items/item-sheets/flaw-item-sheet.js'
import { FlawItemModel } from '../items/data-models/flaw-item-model.js'
// Lifepath
import { LifepathItemSheet } from '../items/item-sheets/lifepath-item-sheet.js'
import { LifepathItemModel } from '../items/data-models/lifepath-item-model.js'
// Merit
import { MeritItemSheet } from '../items/item-sheets/merit-item-sheet.js'
import { MeritItemModel } from '../items/data-models/merit-item-model.js'
// Nature
import { NatureItemSheet } from '../../splats/vampire/items/item-sheets/nature-item-sheet.js'
import { NatureItemModel } from '../../splats/vampire/items/data-models/nature-item-model.js'
// Condition
import { ConditionItemSheet } from '../items/item-sheets/condition-item-sheet.js'
import { ConditionItemModel } from '../items/data-models/condition-item-model.js'
// NPC Ability
import { WoDNpcAbilityItemModel } from '../items/data-models/npc-ability-item-model.js'
import { NpcAbilityItemSheet } from '../items/item-sheets/npc-ability-item-sheet.js'

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
    chatTemplate: 'systems/wod6e/templates/core/chat/resource-item.hbs',
    img: '',
    types: ['resource'],
    sheetClass: ResourceItemSheet,
    sheetModel: ResourceItemModel,
    splat: 'core',
    subtypes: ResourceTypes,
    subtypePath: 'resourceType'
  }

  static action = {
    label: 'TYPES.Item.action',
    chatTemplate: 'systems/wod6e/templates/core/chat/action-item.hbs',
    img: '',
    types: ['action'],
    sheetClass: ActionItemSheet,
    sheetModel: ActionItemModel,
    splat: 'core',
    subtypes: ActionGroups,
    subtypePath: 'group'
  }

  static equipment = {
    label: 'TYPES.Item.equipment',
    chatTemplate: 'systems/wod6e/templates/core/chat/equipment-item.hbs',
    img: '',
    types: ['equipment'],
    sheetClass: EquipmentItemSheet,
    sheetModel: EquipmentItemModel,
    splat: 'core'
  }

  static flaw = {
    label: 'TYPES.Item.flaw',
    chatTemplate: 'systems/wod6e/templates/core/chat/flaw-item.hbs',
    img: '',
    types: ['flaw'],
    sheetClass: FlawItemSheet,
    sheetModel: FlawItemModel,
    splat: 'core'
  }

  static lifepath = {
    label: 'TYPES.Item.lifepath',
    chatTemplate: 'systems/wod6e/templates/core/chat/lifepath-item.hbs',
    img: '',
    types: ['lifepath'],
    sheetClass: LifepathItemSheet,
    sheetModel: LifepathItemModel,
    splat: 'core'
  }

  static merit = {
    label: 'TYPES.Item.merit',
    chatTemplate: 'systems/wod6e/templates/core/chat/merit-item.hbs',
    img: '',
    types: ['merit'],
    sheetClass: MeritItemSheet,
    sheetModel: MeritItemModel,
    splat: 'core'
  }

  static condition = {
    label: 'TYPES.Item.condition',
    chatTemplate: 'systems/wod6e/templates/core/chat/condition-item.hbs',
    img: '',
    types: ['condition'],
    sheetClass: ConditionItemSheet,
    sheetModel: ConditionItemModel,
    splat: 'core'
  }

  static npcAbility = {
    label: 'TYPES.Item.npcAbility',
    chatTemplate: 'systems/wod6e/templates/core/chat/npc-ability-item.hbs',
    img: '',
    types: ['npcAbility'],
    sheetClass: NpcAbilityItemSheet,
    sheetModel: WoDNpcAbilityItemModel,
    restrictedActorTypes: ['npc'],
    splat: 'core'
  }

  static nature = {
    label: 'TYPES.Item.nature',
    chatTemplate: 'systems/wod6e/templates/core/chat/nature-item.hbs',
    img: '',
    types: ['nature'],
    sheetClass: NatureItemSheet,
    sheetModel: NatureItemModel,
    limitOnePerActor: true,
    splat: 'vampire'
  }

  static clan = {
    label: 'TYPES.Item.clan',
    chatTemplate: 'systems/wod6e/templates/core/chat/clan-item.hbs',
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
    chatTemplate: 'systems/wod6e/templates/core/chat/clan-trait-item.hbs',
    img: '',
    types: ['clanTrait'],
    sheetClass: ClanTraitItemSheet,
    sheetModel: ClanTraitItemModel,
    restrictedActorTypes: ['vampire'],
    splat: 'vampire'
  }

  static discipline = {
    label: 'TYPES.Item.discipline',
    chatTemplate: 'systems/wod6e/templates/core/chat/discipline-item.hbs',
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
