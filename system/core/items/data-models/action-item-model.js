import { WoDItemModel } from './base-item-model.js'

const fields = foundry.data.fields

export class ActionItemModel extends WoDItemModel {
  static defineSchema() {
    const schema = super.defineSchema()

    // All the below options are associated with a definition file
    schema.group = new fields.StringField({
      initial: 'general'
    })

    schema.activation = new fields.StringField({
      initial: 'action'
    })

    schema.role = new fields.StringField({
      initial: 'utility'
    })

    schema.actionType = new fields.StringField({
      initial: 'untyped'
    })

    schema.distance = new fields.StringField({
      initial: 'none'
    })

    schema.difficulty = new fields.SchemaField({
      type: new fields.StringField({
        initial: 'variable'
      }),
      fixed: new fields.NumberField({
        initial: null,
        min: 0,
        integer: true,
        nullable: true
      }),
      attribute: new fields.StringField({
        initial: ''
      }),
      useNpcLevel: new fields.BooleanField({
        initial: false
      }),
      description: new fields.HTMLField({
        initial: ''
      })
    })

    // One or more dicepools
    schema.test = new fields.SchemaField({
      description: new fields.StringField({
        initial: ''
      }),
      attributes: new fields.SetField(
        new fields.StringField({
          blank: false,
          nullable: false
        }),
        {
          initial: []
        }
      ),

      skills: new fields.SetField(
        new fields.StringField({
          blank: false,
          nullable: false
        }),
        {
          initial: []
        }
      ),

      disciplines: new fields.SetField(
        new fields.StringField({
          blank: false,
          nullable: false
        }),
        {
          initial: []
        }
      )
    })

    // Result text should stay flexible because action outcomes vary heavily
    schema.result = new fields.HTMLField({
      initial: ''
    })

    schema.failure = new fields.HTMLField({
      initial: ''
    })

    schema.painfulFailure = new fields.HTMLField({
      initial: ''
    })

    schema.specialRules = new fields.HTMLField({
      initial: ''
    })

    // Used by attacks
    schema.damage = new fields.SchemaField({
      resource: new fields.StringField({
        initial: ''
      }),
      formula: new fields.StringField({
        initial: ''
      }),
      extraSuccesses: new fields.BooleanField({
        initial: false
      })
    })

    // Useful for identifying actions that require special circumstances
    schema.requirements = new fields.ArrayField(new fields.StringField(), {
      initial: []
    })

    return schema
  }
}
