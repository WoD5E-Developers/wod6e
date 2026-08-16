// Return only the targets that make sense for a given effect type.
export const getTargetOptions = (type) => {
  // Target groups
  const attributeTargets = Object.entries(WOD6E.configs.Attributes.getList({}))
    .filter(([, attribute]) => !attribute.hidden)
    .map(([key, attribute]) => ({
      key,
      label: attribute.displayName,
      type: 'attribute'
    }))

  const skillTargets = Object.entries(WOD6E.configs.Skills.getList({}))
    .filter(([, skill]) => !skill.hidden)
    .map(([key, skill]) => ({
      key,
      label: skill.displayName,
      type: 'skill'
    }))

  const disciplineTargets = Object.entries(WOD6E.configs.Disciplines.getList({}))
    .filter(([, discipline]) => !discipline.hidden)
    .map(([key, discipline]) => ({
      key,
      label: discipline.displayName,
      type: 'discipline'
    }))

  const resourceTargets = Object.entries(WOD6E.configs.ResourceTypes.getList({}))
    .filter(([, resource]) => !resource.hidden)
    .map(([key, resource]) => ({
      key,
      label: resource.displayName,
      type: 'resource'
    }))

  switch (type) {
    // Predicates and Exclusions
    case 'predicate':
      return [...attributeTargets, ...skillTargets, ...disciplineTargets]

    case 'exclusion':
      return [...attributeTargets, ...skillTargets, ...disciplineTargets]

    // Different kinds of Effect Types
    case 'dice':
      return [...attributeTargets, ...skillTargets, ...disciplineTargets]

    case 'cost':
      return [...attributeTargets, ...skillTargets, ...disciplineTargets]

    case 'resource':
      return resourceTargets

    case 'resourceMaximum':
      return resourceTargets

    case 'baseDifficulty':
      return [...attributeTargets, ...skillTargets, ...disciplineTargets]

    case 'difficulty':
      return [...attributeTargets, ...skillTargets, ...disciplineTargets]

    case 'basicSuccess':
      return [...attributeTargets, ...skillTargets, ...disciplineTargets]

    case 'automaticSuccess':
      return [...attributeTargets, ...skillTargets, ...disciplineTargets]

    case 'automaticFailure':
      return [...attributeTargets, ...skillTargets, ...disciplineTargets]

    default:
      return [...attributeTargets, ...skillTargets, ...disciplineTargets]
  }
}
