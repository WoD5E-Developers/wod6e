import { WoDItemModel } from './base-item-model.js'

export class ResourceItemModel extends WoDItemModel {
  static defineSchema() {
    const fields = foundry.data.fields

    const schema = super.defineSchema()

    // Resource value
    schema.value = new fields.NumberField({ initial: 1, min: 0, integer: true, nullable: false })

    // Resource type
    schema.resourceType = new fields.StringField({ initial: 'wealth' })

    return schema
  }
}
