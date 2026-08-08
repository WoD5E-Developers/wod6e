import { WoDItemModel } from './base-item-model.js'
import { activationFields } from './fields/activation-fields.js'
import { difficultyFields } from './fields/difficulty-fields.js'
import { testFields } from './fields/test-fields.js'

export class MeritItemModel extends WoDItemModel {
  static defineSchema() {
    const schema = super.defineSchema()

    schema.difficulty = difficultyFields()
    schema.activation = activationFields()
    schema.test = testFields()

    return schema
  }
}
