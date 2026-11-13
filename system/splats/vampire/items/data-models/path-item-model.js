import { WoDItemModel } from '../../../../core/items/data-models/base-item-model.js'

export class PathItemModel extends WoDItemModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      ...super.defineSchema(),
      pathType: new fields.StringField({ initial: 'custom', nullable: false }),
      teachings: new fields.StringField({ initial: '', nullable: false }),
      resistanceTeaching: new fields.BooleanField({ initial: false }),
      precepts: new fields.ArrayField(
        new fields.SchemaField({
          precept: new fields.StringField({ initial: '', nullable: false }),
          violation: new fields.StringField({ initial: '', nullable: false })
        }),
        { initial: [] }
      )
    }
  }
}
