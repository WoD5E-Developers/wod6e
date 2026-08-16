const fields = foundry.data.fields

// Main export, a TypedObjectField with the Skill Field's data model
export function skillFields() {
  return new fields.TypedObjectField(skillValueField(), {
    initial: createInitialSkills()
  })
}

function skillValueField() {
  return new fields.SchemaField({
    max: new fields.NumberField({ initial: 5, min: 1, integer: true, nullable: false }),
    value: new fields.NumberField({ initial: 0, min: 0, integer: true, nullable: false }),
    effective: new fields.NumberField({ initial: 0, min: 0, integer: true, nullable: false }),
    focuses: new fields.ArrayField(new foundry.data.fields.StringField({}))
  })
}

// Register all initial skill fields and values of them
export function createInitialSkills() {
  const skills = {}

  for (const key of Object.keys(WOD6E.configs.Skills.getList({}))) {
    skills[key] = createInitialSkillValue()
  }

  return skills
}

export function createInitialSkillValue() {
  return {
    value: 0,
    max: 5,
    focuses: []
  }
}
