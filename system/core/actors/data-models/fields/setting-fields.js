const fields = foundry.data.fields

export function settingFields() {
  return {
    settings: new fields.SchemaField({
      limited: new fields.SchemaField({
        biography: new fields.BooleanField({ initial: false }),
        appearance: new fields.BooleanField({ initial: true }),
        creatureType: new fields.BooleanField({ initial: false }),
        subtype: new fields.BooleanField({ initial: false }),
        motivation: new fields.BooleanField({ initial: false })
      }),

      // SPC-specific settings
      enableDisciplines: new fields.BooleanField({ initial: false })
    })
  }
}
