import { WoDItemModel } from './base-item-model.js'
import { conditionFields } from './fields/condition-fields.js'
import { effectFields } from './fields/effect-fields.js'

export class ConditionItemModel extends WoDItemModel {
  static defineSchema() {
    const schema = super.defineSchema()

    schema.condition = conditionFields()
    schema.effects = effectFields()

    return schema
  }
}
