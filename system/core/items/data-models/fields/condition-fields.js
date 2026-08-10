const fields = foundry.data.fields

export function conditionFields() {
  return new fields.SchemaField({
    duration: new fields.StringField({
      required: true,
      initial: 'none'
    }),

    stacks: new fields.SchemaField({
      stackable: new fields.BooleanField({
        required: true,
        initial: false
      }),
      max: new fields.NumberField({
        required: true,
        nullable: false,
        integer: true,
        min: 1,
        initial: 1
      }),
      current: new fields.NumberField({
        required: true,
        nullable: false,
        integer: true,
        min: 1,
        initial: 1
      })
    }),

    bodyPart: new fields.StringField({
      required: false,
      nullable: true,
      initial: null
    }),

    sourceUuid: new fields.StringField({
      required: false,
      nullable: true,
      initial: null
    }),

    targetUuid: new fields.StringField({
      required: false,
      nullable: true,
      initial: null
    })
  })
}
