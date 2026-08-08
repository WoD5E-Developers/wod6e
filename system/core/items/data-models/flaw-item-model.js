import { WoDItemModel } from './base-item-model.js'

export class FlawItemModel extends WoDItemModel {
  static defineSchema() {
    // const fields = foundry.data.fields

    const schema = super.defineSchema()

    return schema
  }
}
