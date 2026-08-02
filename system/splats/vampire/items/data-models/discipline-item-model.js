import { WoDItemModel } from '../../../../core/items/data-models/base-item-model.js'

export class DisciplineItemModel extends WoDItemModel {
  static defineSchema() {
    const fields = foundry.data.fields

    const schema = super.defineSchema()

    // Resource value
    schema.level = new fields.NumberField({ initial: 1, min: 0, integer: true, nullable: false })

    // Resource type
    schema.disciplineType = new fields.StringField({ initial: 'animalism' })

    return schema
  }
}
