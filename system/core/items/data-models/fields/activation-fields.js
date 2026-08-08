const fields = foundry.data.fields

// Main export, a TypedObjectField with the Skill Field's data model
export function activationFields() {
  return new fields.SchemaField({
    activationType: new fields.StringField({
      initial: 'action'
    }),

    distance: new fields.StringField({
      initial: 'none'
    }),

    damage: new fields.SchemaField({
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
