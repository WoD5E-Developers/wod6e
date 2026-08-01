import { attributeFields } from './attribute-fields.js'
import { skillFields } from './skill-fields.js'
import { settingFields } from './setting-fields.js'
import { vampireFields } from '../../../splats/vampire/actors/data-models/vampire-fields.js'

export class WoDActorModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields

    const schema = {}

    // Locked field, controls whether the sheet is locked or unlocked
    schema.locked = new fields.BooleanField({ initial: false })

    // Health fields
    schema.health = new fields.SchemaField({
      baneful: new fields.NumberField({ initial: 0 }),
      superficial: new fields.NumberField({ initial: 0 }),
      max: new fields.NumberField({ initial: 5 }),
      value: new fields.NumberField({ initial: 5 })
    })

    // Determines whether an actor sheet has attribute data for processing
    schema.hasAttributeData = new fields.BooleanField({ initial: true })

    // Attribute fields
    schema.attributes = attributeFields()

    // Determines whether an actor sheet has skill data for processing
    schema.hasSkillData = new fields.BooleanField({ initial: true })

    // Skill fields
    schema.skills = skillFields()

    // Age fields
    schema.age = new fields.SchemaField({
      apparent: new fields.NumberField({ initial: null, nullable: true }),
      actual: new fields.NumberField({ initial: null, nullable: true })
    })

    // Archetype field
    schema.archetype = new fields.StringField({ initial: '', nullable: false })

    // Setting fields
    Object.assign(schema, settingFields())

    // Splat-specific fields
    Object.assign(schema, vampireFields())

    return schema
  }
}
