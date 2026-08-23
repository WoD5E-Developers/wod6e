import { WoDItemModel } from './base-item-model.js'

export class ResourceItemModel extends WoDItemModel {
  static defineSchema() {
    const fields = foundry.data.fields
    const schema = super.defineSchema()

    schema.dots = new fields.SchemaField({
      max: new fields.NumberField({ initial: 5, min: 1, integer: true, nullable: false }),
      value: new fields.NumberField({ initial: 0, min: 0, integer: true, nullable: false })
    })

    schema.resourceType = new fields.StringField({
      initial: 'wealth'
    })

    // The group member who contributed this resource to a pooled resource list
    // Only applicable to group sheets
    schema.contributedByUuid = new fields.StringField({ initial: '' })

    return schema
  }
}
