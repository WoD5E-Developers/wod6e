import { WoDItemModel } from './base-item-model.js'
import { conditionFields } from './fields/condition-fields.js'
import { effectFields } from './fields/effect-fields.js'
import { restrictionFields } from './fields/restriction-fields.js'

export class ConditionItemModel extends WoDItemModel {
  static defineSchema() {
    const schema = super.defineSchema()

    schema.condition = conditionFields()
    schema.effects = effectFields()
    schema.restrictions = restrictionFields()

    return schema
  }
}
