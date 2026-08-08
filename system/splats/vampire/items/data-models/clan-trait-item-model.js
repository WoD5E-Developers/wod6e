import { WoDItemModel } from '../../../../core/items/data-models/base-item-model.js'
import { activationFields } from '../../../../core/items/data-models/fields/activation-fields.js'
import { prerequisiteFields } from '../../../../core/items/data-models/fields/prerequisites.js'
const fields = foundry.data.fields

export class ClanTraitItemModel extends WoDItemModel {
  static defineSchema() {
    const schema = super.defineSchema()

    schema.prerequisites = prerequisiteFields()

    schema.cost = new fields.NumberField({ initial: null, min: 0, integer: true, nullable: true })

    schema.activation = activationFields()

    schema.passive = new fields.BooleanField({ initial: false })

    return schema
  }
}
