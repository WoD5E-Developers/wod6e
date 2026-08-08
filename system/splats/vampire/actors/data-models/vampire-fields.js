import { disciplineFields } from './fields/discipline-fields.js'

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
        max: new fields.NumberField({ initial: 7, min: 1, integer: true, nullable: false }),
        value: new fields.NumberField({ initial: 4, min: 0, integer: true, nullable: false }),
        disabled: new fields.NumberField({ initial: 0, min: 0, integer: true, nullable: false }),
        canBeDisabled: new fields.BooleanField({ initial: false })
      }),

      nature: new fields.SchemaField({
        max: new fields.NumberField({ initial: 5, min: 1, integer: true, nullable: false }),
        value: new fields.NumberField({ initial: 0, min: 0, integer: true, nullable: false }),
        disabled: new fields.NumberField({ initial: 0, min: 0, integer: true, nullable: false }),
        canBeDisabled: new fields.BooleanField({ initial: false })
      }),

      beast: new fields.SchemaField({
        max: new fields.NumberField({ initial: 5, min: 1, integer: true, nullable: false }),
        value: new fields.NumberField({ initial: 0, min: 0, integer: true, nullable: false }),
        disabled: new fields.NumberField({ initial: 0, min: 0, integer: true, nullable: false }),
        canBeDisabled: new fields.BooleanField({ initial: false })
      }),

      disciplines: disciplineFields()
    })
  }
}
