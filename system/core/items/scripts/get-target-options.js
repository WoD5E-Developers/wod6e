// Return target options belonging to the requested target groups.
export const getTargetOptions = async ({ types = [], usePaths, actor = null }) => {
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

  if (types.includes('items')) {
    targetGroups.items = await getItemOptions({ actor })
  }

  return types.flatMap((type) => targetGroups[type] ?? [])
}

// Compile options of items across different sources
export const getItemOptions = async ({ actor = null } = {}) => {
  const options = []

  const hasValues = (values) => (values?.size ?? values?.length ?? 0) > 0

  const addItem = (item) => {
    // Ignore items without a dataItemId set
    const dataItemId = item?.flags?.wod6e?.dataItemId
    if (!dataItemId) return

    // Ignore items without a configured test
    const test = item.system?.test
    const hasTest =
      hasValues(test?.attributes) || hasValues(test?.skills) || hasValues(test?.disciplines)
    if (!hasTest) return

    options.push({
      key: dataItemId,
      label: item.name,
      type: 'item'
    })
  }

  // World Items
  for (const item of game.items) {
    if (!item.testUserPermission(game.user, CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER)) continue

    addItem(item)
  }

  // Current Actor Items
  if (actor) {
    for (const item of actor.items) {
      if (!item.testUserPermission(game.user, CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER)) continue

      addItem(item)
    }
  }

  // Compendium Items
  for (const pack of game.packs) {
    if (pack.documentName !== 'Item') continue

    const index = await pack.getIndex({
      fields: [
        'name',
        'flags.wod6e.dataItemId',
        'system.test.attributes',
        'system.test.skills',
        'system.test.disciplines'
      ]
    })

    for (const item of index) {
      addItem(item)
    }
  }

  // De-duplicate by dataItemId
  return [...new Map(options.map((option) => [option.key, option])).values()]
}
