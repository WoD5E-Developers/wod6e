const fields = foundry.data.fields

export function activationFields() {
  return new fields.SchemaField({
    activationType: new fields.StringField({
      initial: 'none'
    }),

    distance: new fields.StringField({
      initial: 'none'
    }),

    duration: new fields.StringField({ initial: '' }),

    damage: new fields.SchemaField({
      dealsDamage: new fields.BooleanField({ initial: false }),
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
  })
}
