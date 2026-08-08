export async function prepareActionTestContext(context, item) {
  const itemData = item.system

  // Tab data
  context.tab = context.tabs.test

  const test = itemData.test

  // Attributes
  const selectedAttributes = new Set(test.attributes ?? [])
  const attributeOptions = Object.entries(WOD6E.configs.Attributes.getList({}))
    .filter(([, attribute]) => !attribute.hidden)
    .map(([key, attribute]) => ({
      key,
      label: attribute.displayName,
      selected: selectedAttributes.has(key)
    }))
  const selectedAttributeLabels = attributeOptions
    .filter((attribute) => attribute.selected)
    .map((attribute) => attribute.label)

  // Skills
  const selectedSkills = new Set(test.skills ?? [])
  const skillOptions = Object.entries(WOD6E.configs.Skills.getList({}))
    .filter(([, skill]) => !skill.hidden)
    .map(([key, skill]) => ({
      key,
      label: skill.displayName,
      selected: selectedSkills.has(key)
    }))
  const selectedSkillLabels = skillOptions
    .filter((skill) => skill.selected)
    .map((skill) => skill.label)

  // Disciplines
  const selectedDisciplines = new Set(test.disciplines ?? [])
  const disciplineOptions = Object.entries(WOD6E.configs.Disciplines.getList({}))
    .filter(([, discipline]) => !discipline.hidden)
    .map(([key, discipline]) => ({
      key,
      label: discipline.displayName,
      selected: selectedDisciplines.has(key)
    }))
  const selectedDisciplineLabels = disciplineOptions
    .filter((discipline) => discipline.selected)
    .map((discipline) => discipline.label)

  context.test = {
    description: test.description ?? '',

    attributeOptions,
    selectedAttributesText: selectedAttributeLabels.length
      ? selectedAttributeLabels.join(', ')
      : game.i18n.localize('WOD6E.NoneSelected'),

    skillOptions,
    selectedSkillsText: selectedSkillLabels.length
      ? selectedSkillLabels.join(', ')
      : game.i18n.localize('WOD6E.NoneSelected'),

    disciplineOptions,
    selectedDisciplinesText: selectedDisciplineLabels.length
      ? selectedDisciplineLabels.join(', ')
      : game.i18n.localize('WOD6E.NoneSelected')
  }

  return context
}

export async function prepareActionDifficultyContext(context, item) {
  const itemData = item.system

  // Tab data
  context.tab = context.tabs.difficulty

  // Main dropdown
  context.actionDifficultyOptions = WOD6E.configs.ActionDifficulties.getList({})
  context.actionDifficultySelected = itemData?.difficulty?.type || ''

  // Additional options
  const difficultyType = context.actionDifficultyOptions[context.actionDifficultySelected]
  context.showFixedDifficulty = difficultyType?.usesFixedValue ?? false
  context.showAttributeSelector = difficultyType?.usesAttribute ?? false

  return context
}

export async function prepareActionActivationContext(context, item) {
  const itemData = item.system

  // Tab data
  context.tab = context.tabs.activation

  // Activation dropdown
  context.actionActivationOptions = WOD6E.configs.ActionActivations.getList({})
  context.actionActivationSelected = itemData?.activation?.activationType || ''

  // Distance dropdown
  context.actionDistanceOptions = WOD6E.configs.ActionDistances.getList({})
  context.actionDistanceSelected = itemData?.activation?.distance || ''

  return context
}
