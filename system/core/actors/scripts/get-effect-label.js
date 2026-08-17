export function getEffectLabel(value) {
  if (!value) return value

  const definitions = {
    attribute: WOD6E.configs.Attributes.getList({ usePath: true }),
    skill: WOD6E.configs.Skills.getList({ usePath: true }),
    discipline: WOD6E.configs.Disciplines.getList({ usePath: true }),
    resource: WOD6E.configs.ResourceTypes.getList({ usePath: true })
  }

  // Check for a direct path match
  for (const definition of Object.values(definitions)) {
    const match = definition[value]

    if (match) {
      return match.label
    }
  }

  // Preserve unknown values instead of displaying nothing
  return value
}
