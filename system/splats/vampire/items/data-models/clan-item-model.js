import { WoDItemModel } from '../../../../core/items/data-models/base-item-model.js'
import { testFields } from '../../../../core/items/data-models/fields/test-fields.js'

export class ClanItemModel extends WoDItemModel {
  static defineSchema() {
    const fields = foundry.data.fields

    const schema = super.defineSchema()

    schema.curse = new fields.SchemaField({
      name: new fields.StringField({ initial: '' }),
      description: new fields.HTMLField({ initial: '' })
    })

    schema.beast = new fields.SchemaField({
      name: new fields.StringField({ initial: '' }),
      description: new fields.HTMLField({ initial: '' })
    })

    schema.frenzy = new fields.SchemaField({
      name: new fields.StringField({ initial: '' }),
      description: new fields.HTMLField({ initial: '' })
    })

    schema.disciplines = new fields.SetField(
      new fields.StringField({
        blank: false,
        nullable: false
      }),
      {
        initial: []
      }
    )

    schema.test = testFields()

    return schema
  }
}
