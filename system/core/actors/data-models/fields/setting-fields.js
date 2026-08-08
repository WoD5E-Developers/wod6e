const fields = foundry.data.fields

export function settingFields() {
  return {
    settings: new fields.SchemaField({
      limited: new fields.SchemaField({
        biography: new fields.BooleanField({ initial: true }),
        appearance: new fields.BooleanField({ initial: true }),
        touchstones: new fields.BooleanField({ initial: false }),
        tenets: new fields.BooleanField({ initial: false })
      }),

      // SPC-specific settings
      enableDisciplines: new fields.BooleanField({ initial: false })
    })
  }
}
