export const prepareConditionDetailsContext = async function (context, item) {
  const itemData = item.system
  const condition = itemData?.condition ?? {}

  // Tab data
  context.tab = context.tabs.condition

  // Part-specific data
  context.condition = condition

  return context
}

export const prepareConditionEffectsContext = async function (context, item) {
  const itemData = item.system

  // Tab data
  context.tab = context.tabs.effects

  // Shared target list
  const targets = [
    ...Object.entries(WOD6E.configs.Attributes.getList({}))
      .filter(([, attribute]) => !attribute.hidden)
      .map(([key, attribute]) => ({
        key,
        label: attribute.displayName,
        type: 'attribute'
      })),

    ...Object.entries(WOD6E.configs.Skills.getList({}))
      .filter(([, skill]) => !skill.hidden)
      .map(([key, skill]) => ({
        key,
        label: skill.displayName,
        type: 'skill'
      })),

    ...Object.entries(WOD6E.configs.Disciplines.getList({}))
      .filter(([, discipline]) => !discipline.hidden)
      .map(([key, discipline]) => ({
        key,
        label: discipline.displayName,
        type: 'discipline'
      }))
  ]

  // Part-specific data
  context.effects = (itemData?.effects ?? []).map((effect) => {
    const selectedTargets = new Set(effect.targets ?? [])

    const targetOptions = targets.map((target) => ({
      ...target,
      selected: selectedTargets.has(target.key)
    }))

    const selectedTargetsLabels = targetOptions
      .filter((target) => target.selected)
      .map((target) => target.label)

    return {
      ...effect,

      predicateText: (effect.predicate ?? []).join(', '),
      excludesText: (effect.excludes ?? []).join(', '),

      targetOptions,

      selectedTargetsText: selectedTargetsLabels.length
        ? selectedTargetsLabels.join(', ')
        : game.i18n.localize('WOD6E.NoneSelected')
    }
  })

  context.effectTypeOptions = {
    dice: 'WOD6E.CONDITIONS.Dice',
    difficulty: 'WOD6E.CONDITIONS.Difficulty'
  }

  context.effectModeOptions = {
    add: 'WOD6E.Add',
    subtract: 'WOD6E.Subtract',
    override: 'WOD6E.Override'
  }

  return context
}
