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

      valueSource: new fields.StringField({
        required: true,
        initial: 'flat',
        choices: {
          flat: 'Flat',
          trait: 'Actor Trait',
          sourceTrait: "Source Actor's Trait"
        }
      }),

      valueTrait: new fields.StringField({ initial: '' }),

      predicates: new fields.SetField(
        new fields.StringField({
          blank: false,
          nullable: false
        }),
        {
          initial: []
        }
      ),

      exclusions: new fields.SetField(
        new fields.StringField({
          blank: false,
          nullable: false
        }),
        {
          initial: []
        }
      )
    }),
    {
      required: true,
      initial: []
    }
  )
}
