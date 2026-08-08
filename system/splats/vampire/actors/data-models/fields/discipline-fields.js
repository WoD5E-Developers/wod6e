const fields = foundry.data.fields

// Main export, a TypedObjectField with the Discipline Field's data model
export function disciplineFields() {
  return new fields.TypedObjectField(disciplineValueField(), {
    initial: createInitialDisciplines()
  })
}

function disciplineValueField() {
  return new fields.SchemaField({
    max: new fields.NumberField({ initial: 5, min: 1, integer: true, nullable: false }),
    value: new fields.NumberField({ initial: 0, min: 0, integer: true, nullable: false }),
    visible: new fields.BooleanField({ initial: false, nullable: false })
  })
}

// Register all initial discipline fields and values of them
export function createInitialDisciplines() {
  const disciplines = {}

  for (const key of Object.keys(WOD6E.configs.Disciplines.getList({}))) {
    disciplines[key] = createInitialDisciplineValue()
  }

  return disciplines
}

export function createInitialDisciplineValue() {
  return {
    value: 0,
    max: 5,
    visible: false
  }
}
