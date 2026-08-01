const fields = foundry.data.fields

export function vampireFields() {
  return {
    // Determines whether an actor sheet has discipline data for processing
    hasDisciplineData: new fields.BooleanField({ initial: true }),

    vampire: new fields.SchemaField({
      date: new fields.SchemaField({
        embrace: new fields.StringField({ initial: '', nullable: false }),
        nostalgic: new fields.StringField({ initial: '', nullable: false })
      }),

      clan: new fields.SchemaField({
        name: new fields.StringField({ initial: '', nullable: false }),
        curse: new fields.StringField({ initial: '', nullable: false })
      }),

      generation: new fields.NumberField({ initial: null, nullable: true }),

      sire: new fields.SchemaField({
        name: new fields.StringField({ initial: '', nullable: false })
      }),

      humanity: new fields.SchemaField({
        max: new fields.NumberField({ initial: 7, min: 1 }),
        value: new fields.NumberField({ initial: 4, min: 0 }),
        disabled: new fields.NumberField({ initial: 0, min: 0 }),
        canBeDisabled: new fields.BooleanField({ initial: false })
      }),

      disciplines: new fields.ObjectField({
        initial: {}
      })
    })
  }
}
