const fields = foundry.data.fields

// Main export, a TypedObjectField with the Skill Field's data model
export function testFields() {
  return new fields.SchemaField({
    description: new fields.StringField({
      initial: ''
    }),

    // Existing item lists are alternatives, matching their displayed "or" labels.
    // "all" also supports additive tests such as Composure + Resolve.
    attributeMode: new fields.StringField({ initial: 'any', choices: ['any', 'all'] }),
    skillMode: new fields.StringField({ initial: 'any', choices: ['any', 'all'] }),
    disciplineMode: new fields.StringField({ initial: 'any', choices: ['any', 'all'] }),
    resistBeast: new fields.BooleanField({ initial: false }),
    humanityModifier: new fields.BooleanField({ initial: false }),
    bargainRule: new fields.StringField({
      initial: 'standard',
      choices: ['standard', 'forbidden']
    }),

    modifier: new fields.SchemaField({
      valueSource: new fields.StringField({
        required: true,
        initial: 'flat',
        choices: {
          flat: 'Flat',
          trait: 'Actor Trait'
        }
      }),
      value: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
      valueTrait: new fields.StringField({ initial: '' }),
      mode: new fields.StringField({
        required: true,
        initial: 'add',
        choices: {
          add: 'Add',
          subtract: 'Subtract'
        }
      })
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
}
