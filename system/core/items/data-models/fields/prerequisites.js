const fields = foundry.data.fields

// Main export, a TypedObjectField with the Skill Field's data model
export function prerequisiteFields() {
  return new fields.SchemaField({
    clanUuid: new fields.StringField({ initial: '' }),
    generationTier: new fields.StringField({ initial: '' }),
    disciplineRequirements: new fields.ArrayField(disciplineRequirementField())
  })
}

function disciplineRequirementField() {
  return new fields.SchemaField({
    options: new fields.ArrayField(
      new fields.SchemaField({
        discipline: new fields.StringField({ initial: '' }),
        dots: new fields.NumberField({
          required: true,
          minimum: 1,
          integer: true
        })
      })
    )
  })
}
