import { attributeFields } from './fields/attribute-fields.js'
import { skillFields } from './fields/skill-fields.js'
import { coreActorFields } from './fields/core-actor-fields.js'
import { vampireFields } from '../../../splats/vampire/actors/data-models/vampire-fields.js'
import { migrateHumanityData } from '../../../splats/vampire/scripts/humanity.js'

export class WoDPlayerActorModel extends foundry.abstract.TypeDataModel {
  static migrateData(source) {
    return super.migrateData(migrateHumanityData(source))
  }

  static defineSchema() {
    const fields = foundry.data.fields

    const schema = {}

    Object.assign(schema, coreActorFields({ includeVitae: true }))

    schema.creatureType = new fields.StringField({
      initial: 'vampire',
      choices: ['vampire', 'duskborn', 'ghoul'],
      nullable: false
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

    // Splat-specific fields
    Object.assign(schema, vampireFields())

    return schema
  }
}
