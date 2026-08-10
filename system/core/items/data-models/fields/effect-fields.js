const fields = foundry.data.fields

export function effectFields() {
  return new fields.ArrayField(
    new fields.SchemaField({
      type: new fields.StringField({
        required: true,
        initial: 'dice'
      }),

      targets: new fields.SetField(
        new fields.StringField({
          blank: false,
          nullable: false
        }),
        {
          initial: []
        }
      ),

      mode: new fields.StringField({
        required: true,
        initial: 'add',
        choices: {
          add: 'Add',
          subtract: 'Subtract',
          override: 'Override'
        }
      }),

      value: new fields.NumberField({
        required: true,
        nullable: false,
        initial: 0
      }),

      predicate: new fields.ArrayField(
        new fields.StringField({
          required: true,
          blank: false
        }),
        {
          required: true,
          initial: []
        }
      ),

      excludes: new fields.ArrayField(
        new fields.StringField({
          required: true,
          blank: false
        }),
        {
          required: true,
          initial: []
        }
      ),

      affectsDerived: new fields.BooleanField({
        required: true,
        initial: true
      })
    }),
    {
      required: true,
      initial: []
    }
  )
}
