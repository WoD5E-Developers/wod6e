import { attributeFields } from './fields/attribute-fields.js'
import { skillFields } from './fields/skill-fields.js'
import { settingFields } from './fields/setting-fields.js'
import { vampireFields } from '../../../splats/vampire/actors/data-models/vampire-fields.js'

export class WoDActorModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields

    const schema = {}

    // Health fields
    schema.health = new fields.SchemaField({
      max: new fields.NumberField({ initial: 5, min: 1, integer: true, nullable: false }),
      value: new fields.NumberField({ initial: 5, min: 0, integer: true, nullable: false }),
      disabled: new fields.NumberField({ initial: 0, min: 0, integer: true, nullable: false }),
      canBeDisabled: new fields.BooleanField({ initial: true, nullable: false })
    })

    // Willpower fields
    schema.willpower = new fields.SchemaField({
      max: new fields.NumberField({ initial: 5, min: 1, integer: true, nullable: false }),
      value: new fields.NumberField({ initial: 5, min: 0, integer: true, nullable: false }),
      disabled: new fields.NumberField({ initial: 0, min: 0, integer: true, nullable: false }),
      canBeDisabled: new fields.BooleanField({ initial: false, nullable: false })
    })

    // Determines whether an actor sheet has attribute data for processing
    schema.hasAttributeData = new fields.BooleanField({ initial: true, nullable: false })

    // Attribute fields
    schema.attributes = attributeFields()

    // Determines whether an actor sheet has skill data for processing
    schema.hasSkillData = new fields.BooleanField({ initial: true, nullable: false })

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
