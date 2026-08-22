import { settingFields } from './setting-fields.js'

const fields = foundry.data.fields

function trackerFields({ canBeDisabled }) {
  return new fields.SchemaField({
    max: new fields.NumberField({ initial: 5, min: 1, integer: true, nullable: false }),
    value: new fields.NumberField({ initial: 5, min: 0, integer: true, nullable: false }),
    disabled: new fields.NumberField({ initial: 0, min: 0, integer: true, nullable: false }),
    canBeDisabled: new fields.BooleanField({ initial: canBeDisabled, nullable: false })
  })
}

// Fields shared by player and NPC actors
// NPC health has an editable maximum because NPCs do not have Stamina
// Include health and willpower by default (since most actors will need it)
export function coreActorFields({ includeHealth = true, includeWillpower = true } = {}) {
  // We can assume these fields will be present (on all actors) eventually but as of writing this code
  // they don't, I just need to get the actual core mechanics in the system before I can
  // start doing things like biography, etc.
  const schema = {
    core: new fields.SchemaField({
      publicNotes: new fields.StringField({ initial: '', nullable: false }),
      appearance: new fields.StringField({ initial: '', nullable: false }),
      biography: new fields.StringField({ initial: '', nullable: false })
    }),
    ...settingFields()
  }

  if (includeHealth) {
    schema.health = trackerFields({ canBeDisabled: true })
  }

  if (includeWillpower) {
    schema.willpower = trackerFields({ canBeDisabled: false })
  }

  return schema
}
