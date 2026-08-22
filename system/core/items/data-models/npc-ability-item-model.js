import { WoDItemModel } from './base-item-model.js'
import { activationFields } from './fields/activation-fields.js'
import { effectFields } from './fields/effect-fields.js'

const fields = foundry.data.fields

export class WoDNpcAbilityItemModel extends WoDItemModel {
  static defineSchema() {
    const schema = super.defineSchema()

    // Limited-use abilities that can be restored through Drama
    schema.uses = new fields.SchemaField({
      enabled: new fields.BooleanField({
        initial: false,
        nullable: false
      }),

      value: new fields.NumberField({
        initial: 0,
        min: 0,
        integer: true,
        nullable: false
      }),

      max: new fields.NumberField({
        initial: 0,
        min: 0,
        integer: true,
        nullable: false
      }),

      period: new fields.StringField({
        initial: 'scene',
        nullable: false
      })
    })

    // Requirements/triggers that determine whether the ability can be used
    schema.requirements = new fields.StringField({
      initial: '',
      nullable: false
    })

    schema.activation = activationFields()
    schema.effects = effectFields()

    return schema
  }
}
