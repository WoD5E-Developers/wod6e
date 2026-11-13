import { disciplineFields } from './fields/discipline-fields.js'

const fields = foundry.data.fields

export function vampireFields() {
  return {
    // Determines whether an actor sheet has discipline data for processing
    hasDisciplineData: new fields.BooleanField({ initial: true }),

    // Determines whether the actor can activate Blood Surge
    canBloodSurge: new fields.BooleanField({ initial: true }),

    vampire: new fields.SchemaField({
      date: new fields.SchemaField({
        embrace: new fields.StringField({ initial: '', nullable: false }),
        nostalgic: new fields.StringField({ initial: '', nullable: false })
      }),

      clan: new fields.SchemaField({
        name: new fields.StringField({ initial: '', nullable: false }),
        curse: new fields.StringField({ initial: '', nullable: false })
      }),

      generation: new fields.SchemaField({
        value: new fields.NumberField({ initial: 13, min: 4, integer: true, nullable: false })
      }),

      sire: new fields.SchemaField({
        type: new fields.StringField({ initial: 'adoptive', nullable: false }),
        character: new fields.SchemaField({
          name: new fields.StringField({ initial: '', nullable: false }),
          uuid: new fields.StringField({ initial: '', nullable: false })
        })
      }),

      humanity: new fields.SchemaField({
        max: new fields.NumberField({
          initial: 10,
          min: 10,
          max: 10,
          integer: true,
          nullable: false
        }),
        value: new fields.NumberField({
          initial: 6,
          min: 0,
          max: 10,
          integer: true,
          nullable: false
        }),
        violations: new fields.NumberField({
          initial: 0,
          min: 0,
          max: 10,
          integer: true,
          nullable: false
        }),
        rulesVersion: new fields.NumberField({ initial: 2, nullable: false }),
        legacy: new fields.ObjectField({ initial: null, nullable: true })
      }),

      disciplines: disciplineFields()
    })
  }
}
