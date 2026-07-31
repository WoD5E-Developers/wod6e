const fields = foundry.data.fields

export function vampireFields() {
  return {
    // Determines whether an actor sheet has discipline data for processing
    hasDisciplineData: new fields.BooleanField({ initial: true }),

    hunger: new fields.SchemaField({
      value: new fields.NumberField({ initial: 1 }),
      max: new fields.NumberField({ initial: 5 })
    }),

    humanity: new fields.SchemaField({
      value: new fields.NumberField({ initial: 7 }),
      stains: new fields.NumberField({ initial: 0 })
    }),

    blood: new fields.SchemaField({
      potency: new fields.NumberField({ initial: 0 }),
      generation: new fields.StringField({ initial: '' })
    }),

    disciplines: new fields.ObjectField({
      initial: {},
      validate: false
    })
  }
}
