import { NpcTiers } from '../../../config/npc-tiers.js'

const fields = foundry.data.fields

export function npcFields() {
  return {
    // Determines which NPC rules are used
    // Minion, standard, elite, any future/custom ones as well
    tier: new fields.StringField({
      initial: 'standard',
      choices: Object.keys(NpcTiers.getList({ disableSort: true })),
      nullable: false
    }),

    creatureType: new fields.StringField({
      initial: '',
      nullable: false
    }),

    subtype: new fields.StringField({
      initial: '',
      nullable: false
    }),

    // Difficulty values for NPCs
    level: new fields.SchemaField({
      // Used by minion and standard NPCs
      value: new fields.NumberField({
        initial: 1,
        min: 1,
        max: 10,
        integer: true,
        nullable: false
      }),

      // Used by elite NPCs
      physical: new fields.NumberField({
        initial: 1,
        min: 1,
        max: 10,
        integer: true,
        nullable: false
      }),

      social: new fields.NumberField({
        initial: 1,
        min: 1,
        max: 10,
        integer: true,
        nullable: false
      }),

      mental: new fields.NumberField({
        initial: 1,
        min: 1,
        max: 10,
        integer: true,
        nullable: false
      })
    }),

    // Short description of what the NPC currently wants
    motivation: new fields.StringField({
      initial: '',
      nullable: false
    }),

    // Minion boolean
    defeated: new fields.BooleanField({
      initial: false,
      nullable: false
    })
  }
}
