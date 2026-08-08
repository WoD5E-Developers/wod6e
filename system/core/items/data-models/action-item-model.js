import { WoDItemModel } from './base-item-model.js'
import { activationFields } from './fields/activation-fields.js'
import { difficultyFields } from './fields/difficulty-fields.js'
import { testFields } from './fields/test-fields.js'

const fields = foundry.data.fields

export class ActionItemModel extends WoDItemModel {
  static defineSchema() {
    const schema = super.defineSchema()

    // All the below options are associated with a definition file
    schema.group = new fields.StringField({
      initial: 'general'
    })

    schema.role = new fields.StringField({
      initial: 'utility'
    })

    schema.actionType = new fields.StringField({
      initial: 'untyped'
    })

    schema.activation = activationFields()
    schema.test = testFields()
    schema.difficulty = difficultyFields()

    return schema
  }
}
