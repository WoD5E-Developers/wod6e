import { npcFields } from './fields/npc-fields.js'
import { coreActorFields } from './fields/core-actor-fields.js'

export class WoDNpcActorModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields

    const schema = {}

    Object.assign(schema, coreActorFields())

    // NPCs use their Level instead of Attributes and Skills
    schema.hasAttributeData = new fields.BooleanField({
      initial: false,
      nullable: false
    })

    schema.hasSkillData = new fields.BooleanField({
      initial: false,
      nullable: false
    })

    // NPCs represent supernatural powers through NPC abilities
    // instead of the normal player Discipline structure
    schema.hasDisciplineData = new fields.BooleanField({
      initial: false,
      nullable: false
    })

    // NPC Fields
    Object.assign(schema, npcFields())

    return schema
  }
}
