import { WoDItemModel } from './base-item-model.js'
import { prerequisiteFields } from './fields/prerequisites.js'

export class LifepathItemModel extends WoDItemModel {
  static defineSchema() {
    const schema = super.defineSchema()

    schema.prerequisites = prerequisiteFields()

    return schema
  }
}
