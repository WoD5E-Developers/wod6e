const fields = foundry.data.fields

export function settingFields() {
  return {
    settings: new fields.SchemaField({
      limited: new fields.SchemaField({
        biography: new fields.BooleanField({ initial: true }),
        appearance: new fields.BooleanField({ initial: true }),
        creatureType: new fields.BooleanField({ initial: true }),
        subtype: new fields.BooleanField({ initial: true }),
        motivation: new fields.BooleanField({ initial: true })
      }),

      // SPC-specific settings
      enableDisciplines: new fields.BooleanField({ initial: false })
    })
  }
}
