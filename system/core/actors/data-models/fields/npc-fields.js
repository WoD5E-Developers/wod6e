import { NpcTiers } from '../../../config/npc-tiers.js'

const fields = foundry.data.fields

export const npcCategories = ['physical', 'social', 'mental']
export const npcCreatureTypes = ['human', 'animal', 'ghoul', 'vampire', 'other']

const poolField = (initial = 0) =>
  new fields.NumberField({ initial, min: 0, integer: true, nullable: false })

export function npcFields() {
  return {
    tier: new fields.StringField({
      initial: 'standard',
      choices: Object.keys(NpcTiers.getList({ disableSort: true })),
      nullable: false
    }),

    // Compatibility with NPCs and token overrides saved with the old Minion checkbox.
    minion: new fields.BooleanField({ initial: false, nullable: false }),

    creatureKind: new fields.StringField({
      initial: 'human',
      choices: npcCreatureTypes,
      nullable: false
    }),

    attributePools: new fields.SchemaField(
      Object.fromEntries(npcCategories.map((key) => [key, poolField(3)]))
    ),

    // A zero skill pool leaves that skill on its category pool.
    skillPools: new fields.TypedObjectField(
      new fields.SchemaField({
        active: new fields.BooleanField({ initial: null, nullable: true }),
        value: poolField(),
        specialization: new fields.StringField({ initial: '', nullable: false })
      }),
      { initial: {} }
    ),

    vampire: new fields.SchemaField({
      clan: new fields.StringField({ initial: '', nullable: false }),
      generationModifier: new fields.NumberField({
        initial: 1,
        min: 1,
        integer: true,
        nullable: false
      }),
      path: new fields.StringField({ initial: '', nullable: false }),
      humanity: new fields.SchemaField({
        value: new fields.NumberField({ initial: 6, min: 0, max: 10, integer: true })
      })
    }),

    // Short description of what the NPC currently wants
    motivation: new fields.StringField({
      initial: '',
      nullable: false
    }),

    legacyNpc: new fields.ObjectField({ initial: null, nullable: true })
  }
}
