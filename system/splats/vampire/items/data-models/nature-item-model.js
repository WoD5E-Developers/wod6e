import { WoDItemModel } from '../../../../core/items/data-models/base-item-model.js'

export class NatureItemModel extends WoDItemModel {
  static defineSchema() {
    const fields = foundry.data.fields

    const schema = super.defineSchema()

    schema.indulging = new fields.HTMLField({ initial: '' })

    schema.outburst = new fields.SchemaField({
      name: new fields.StringField({ initial: '' }),
      description: new fields.HTMLField({ initial: '' })
    })

    return schema
  }
}
