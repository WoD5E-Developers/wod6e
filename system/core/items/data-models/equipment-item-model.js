import { WoDItemModel } from './base-item-model.js'
import { activationFields } from './fields/activation-fields.js'
import { testFields } from './fields/test-fields.js'

export class EquipmentItemModel extends WoDItemModel {
  static defineSchema() {
    const schema = super.defineSchema()

    schema.activation = activationFields()
    schema.test = testFields()

    return schema
  }
}
