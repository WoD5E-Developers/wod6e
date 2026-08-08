export async function prepareActionTestsContext(context, item) {
  const itemData = item.system

  // Tab data
  context.tab = context.tabs.tests

  const attributeOptions = WOD6E.configs.Attributes.getList({})
  const skillOptions = WOD6E.configs.Skills.getList({})
  const disciplineOptions = WOD6E.configs.Disciplines.getList({})

  context.tests = (itemData.tests ?? []).map((test, index) => {
    const selectedAttributes = new Set(test.attributes ?? [])
    const selectedSkills = new Set(test.skills ?? [])
    const selectedDisciplines = new Set(test.disciplines ?? [])

    const preparedAttributes = Object.entries(attributeOptions)
      .filter(([, attribute]) => !attribute.hidden)
      .map(([key, attribute]) => ({
        key,
        label: attribute.displayName,
        selected: selectedAttributes.has(key)
      }))

    const preparedSkills = Object.entries(skillOptions)
      .filter(([, skill]) => !skill.hidden)
      .map(([key, skill]) => ({
        key,
        label: skill.displayName,
        selected: selectedSkills.has(key)
      }))

    const preparedDisciplines = Object.entries(disciplineOptions)
      .filter(([, discipline]) => !discipline.hidden)
      .map(([key, discipline]) => ({
        key,
        label: discipline.displayName,
        selected: selectedDisciplines.has(key)
      }))

    return {
      index,
      description: test.description ?? '',

      attributeOptions: preparedAttributes,
      skillOptions: preparedSkills,
      disciplineOptions: preparedDisciplines,

      selectedAttributesText: preparedAttributes
        .filter((option) => option.selected)
        .map((option) => option.label)
        .join(', '),

      selectedSkillsText: preparedSkills
        .filter((option) => option.selected)
        .map((option) => option.label)
        .join(', '),

      selectedDisciplinesText: preparedDisciplines
        .filter((option) => option.selected)
        .map((option) => option.label)
        .join(', ')
    }
  })

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
  context.actionActivationSelected = itemData?.activation || ''

  // Distance dropdown
  context.actionDistanceOptions = WOD6E.configs.ActionDistances.getList({})
  context.actionDistanceSelected = itemData?.distance || ''

  return context
}
