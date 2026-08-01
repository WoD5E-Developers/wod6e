const fields = foundry.data.fields

// Main export, a TypedObjectField with the Skill Field's data model
export function skillFields() {
  return new fields.TypedObjectField(skillValueField(), {
    initial: createInitialSkills()
  })
}

function skillValueField() {
  return new fields.SchemaField({
    max: new fields.NumberField({ initial: 10, min: 1, integer: true, nullable: false }),
    value: new fields.NumberField({ initial: 0, min: 0, integer: true, nullable: false }),
    specialties: new fields.ArrayField(new fields.ObjectField())
  })
}

// Register all initial skill fields and values of them
export function createInitialSkills() {
  const skills = {}

  for (const key of Object.keys(WOD6E.Skills.getList({}))) {
    skills[key] = createInitialSkillValue()
  }

  return skills
}

export function createInitialSkillValue() {
  return {
    value: 0,
    max: 10,
    specialties: []
  }
}
