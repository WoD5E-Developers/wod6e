const fields = foundry.data.fields

export function restrictionFields() {
  return new fields.ArrayField(
    new fields.SchemaField({
      type: new fields.StringField({
        required: true,
        initial: 'action',
        choices: {
          action: 'Action',
          movement: 'Movement',
          speech: 'Speech',
          attack: 'Attack',
          discipline: 'Discipline',
          reaction: 'Reaction',
          minorAction: 'Minor Action',
          distance: 'Distance',
          assist: 'Assist'
        }
      }),

      mode: new fields.StringField({
        required: true,
        initial: 'prevent',
        choices: {
          prevent: 'Prevent',
          require: 'Require'
        }
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

      value: new fields.StringField({
        required: false,
        nullable: true,
        initial: null
      })
    }),
    {
      required: true,
      initial: []
    }
  )
}
