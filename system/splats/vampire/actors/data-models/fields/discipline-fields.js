const fields = foundry.data.fields

// Main export, a TypedObjectField with the Discipline Field's data model
export function disciplineFields({ npc = false } = {}) {
  return new fields.TypedObjectField(disciplineValueField(npc), {
    initial: createInitialDisciplines(npc)
  })
}

function disciplineValueField(npc) {
  return new fields.SchemaField({
    max: new fields.NumberField({ initial: 5, min: 1, integer: true, nullable: false }),
    value: new fields.NumberField({ initial: 0, min: 0, integer: true, nullable: false }),
    effective: new fields.NumberField({ initial: 0, min: 0, integer: true, nullable: false }),
    ...(npc
      ? { active: new fields.BooleanField({ initial: null, nullable: true }) }
      : { visible: new fields.BooleanField({ initial: false, nullable: false }) })
  })
}

// Register all initial discipline fields and values of them
export function createInitialDisciplines(npc = false) {
  const disciplines = {}

  for (const key of Object.keys(WOD6E.configs.Disciplines.getList({}))) {
    disciplines[key] = createInitialDisciplineValue(npc)
  }

  return disciplines
}

export function createInitialDisciplineValue(npc = false) {
  return {
    value: 0,
    max: 5,
    ...(npc ? { active: null } : { visible: false })
  }
}
