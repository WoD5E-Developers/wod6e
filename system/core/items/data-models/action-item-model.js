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

    schema.activation = activationFields()

    schema.role = new fields.StringField({
      initial: 'utility'
    })

    schema.actionType = new fields.StringField({
      initial: 'untyped'
    })

    schema.difficulty = difficultyFields()

    // One or more dicepools
    schema.test = testFields()

    // Result text should stay flexible because action outcomes vary heavily
    schema.result = new fields.HTMLField({
      initial: ''
    })

    schema.failure = new fields.HTMLField({
      initial: ''
    })

    schema.painfulFailure = new fields.HTMLField({
      initial: ''
    })

    schema.specialRules = new fields.HTMLField({
      initial: ''
    })

    // Useful for identifying actions that require special circumstances
    schema.requirements = new fields.ArrayField(new fields.StringField(), {
      initial: []
    })

    return schema
  }
}
