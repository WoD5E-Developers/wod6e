import { WoDItemModel } from '../../../../core/items/data-models/base-item-model.js'
const fields = foundry.data.fields

export class DisciplineItemModel extends WoDItemModel {
  static defineSchema() {
    const schema = super.defineSchema()

    // Resource value
    schema.level = new fields.NumberField({ initial: 1, min: 0, integer: true, nullable: false })

    // Resource type
    schema.disciplineType = new fields.StringField({ initial: 'animalism' })

    // Requirements
    schema.prerequisites = new fields.SchemaField({
      clanUuid: new fields.StringField({ initial: '' }),
      generationTier: new fields.StringField({ initial: '' }),
      disciplineRequirements: new fields.ArrayField(disciplineRequirementField())
    })

    schema.cost = new fields.NumberField({ initial: null, min: 0, integer: true, nullable: true })

    schema.activation = new fields.StringField({ initial: '' })

    schema.duration = new fields.SchemaField({
      length: new fields.NumberField({ initial: null, min: 0, integer: true, nullable: true }),
      type: new fields.StringField({ initial: '' })
    })

    schema.passive = new fields.BooleanField({ initial: false })

    return schema
  }
}

function disciplineRequirementField() {
  return new fields.SchemaField({
    options: new fields.ArrayField(
      new fields.SchemaField({
        discipline: new fields.StringField({ initial: '' }),
        dots: new fields.NumberField({
          required: true,
          minimum: 1,
          integer: true
        })
      })
    )
  })
}
