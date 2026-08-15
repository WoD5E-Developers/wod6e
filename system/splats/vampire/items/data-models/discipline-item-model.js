import { WoDItemModel } from '../../../../core/items/data-models/base-item-model.js'
import { activationFields } from '../../../../core/items/data-models/fields/activation-fields.js'
import { difficultyFields } from '../../../../core/items/data-models/fields/difficulty-fields.js'
import { prerequisiteFields } from '../../../../core/items/data-models/fields/prerequisites.js'
import { testFields } from '../../../../core/items/data-models/fields/test-fields.js'
const fields = foundry.data.fields

export class DisciplineItemModel extends WoDItemModel {
  static defineSchema() {
    const schema = super.defineSchema()

    schema.level = new fields.NumberField({ initial: 1, min: 0, integer: true, nullable: false })

    schema.disciplineType = new fields.StringField({ initial: 'animalism' })

    schema.attribute = new fields.StringField({
      initial: 'physical'
    })

    schema.maturing = new fields.ArrayField(
      new fields.SchemaField({
        level: new fields.NumberField({
          required: true,
          nullable: false,
          integer: true,
          initial: 2,
          min: 1,
          max: 10
        }),

        description: new fields.HTMLField({
          nullable: false,
          initial: ''
        })
      }),
      {
        initial: []
      }
    )

    schema.activation = activationFields()
    schema.test = testFields()
    schema.difficulty = difficultyFields()
    schema.prerequisites = prerequisiteFields()

    return schema
  }
}
