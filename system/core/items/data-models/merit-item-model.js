import { WoDItemModel } from './base-item-model.js'

export class MeritItemModel extends WoDItemModel {
  static defineSchema() {
    // const fields = foundry.data.fields

    const schema = super.defineSchema()

    return schema
  }
}
