import { WoDItemModel } from '../../../../core/items/data-models/base-item-model.js'
import { activationFields } from '../../../../core/items/data-models/fields/activation-fields.js'
import { difficultyFields } from '../../../../core/items/data-models/fields/difficulty-fields.js'
import { prerequisiteFields } from '../../../../core/items/data-models/fields/prerequisites.js'
import { testFields } from '../../../../core/items/data-models/fields/test-fields.js'
const fields = foundry.data.fields

export class DisciplineItemModel extends WoDItemModel {
  static defineSchema() {
    const schema = super.defineSchema()

    // Resource value
    schema.level = new fields.NumberField({ initial: 1, min: 0, integer: true, nullable: false })

    // Resource type
    schema.disciplineType = new fields.StringField({ initial: 'animalism' })

    // Requirements
    schema.prerequisites = prerequisiteFields()

    schema.cost = new fields.NumberField({ initial: null, min: 0, integer: true, nullable: true })

    schema.difficulty = difficultyFields()
    schema.activation = activationFields()
    schema.test = testFields()

    return schema
  }
}
