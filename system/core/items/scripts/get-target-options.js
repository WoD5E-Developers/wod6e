// Return target options belonging to the requested target groups.
export const getTargetOptions = ({ types = [], usePaths }) => {
  const targetGroups = {
    attributes: Object.entries(WOD6E.configs.Attributes.getList({ usePath: usePaths ?? false }))
      .filter(([, attribute]) => !attribute.hidden)
      .map(([key, attribute]) => ({
        key,
        label: attribute.displayName,
        type: 'attribute'
      })),

    skills: Object.entries(WOD6E.configs.Skills.getList({ usePath: usePaths ?? false }))
      .filter(([, skill]) => !skill.hidden)
      .map(([key, skill]) => ({
        key,
        label: skill.displayName,
        type: 'skill'
      })),

    disciplines: Object.entries(WOD6E.configs.Disciplines.getList({ usePath: usePaths ?? false }))
      .filter(([, discipline]) => !discipline.hidden)
      .map(([key, discipline]) => ({
        key,
        label: discipline.displayName,
        type: 'discipline'
      })),

    resources: Object.entries(WOD6E.configs.ResourceTypes.getList({ usePath: usePaths ?? false }))
      .filter(([, resource]) => !resource.hidden)
      .map(([key, resource]) => ({
        key,
        label: resource.displayName,
        type: 'resource'
      }))
  }

  return types.flatMap((type) => targetGroups[type] ?? [])
}
