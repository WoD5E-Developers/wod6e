import { buildEnrichedField } from './build-enriched-field.js'
import { formatOptionLabel, formatTest } from './format-test-labels.js'

export const prepareDescriptionContext = async function (context, item) {
  const itemData = item.system

  // Tab data
  context.tab = context.tabs.description

  // Part-specific data
  context.description = await buildEnrichedField({
    path: 'system.description',
    value: itemData?.description
  })

  return context
}

export async function prepareTestContext(context, item) {
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
    selectedAttributesText: formatOptionLabel(selectedAttributeLabels),

    skillOptions,
    selectedSkillsText: formatOptionLabel(selectedSkillLabels),

    disciplineOptions,
    selectedDisciplinesText: formatOptionLabel(selectedDisciplineLabels),

    testText: formatTest(selectedAttributeLabels, selectedSkillLabels, selectedDisciplineLabels)
  }

  return context
}

export async function prepareDifficultyContext(context, item) {
  const itemData = item.system

  // Tab data
  context.tab = context.tabs.difficulty

  // Main dropdown
  context.difficultyOptions = WOD6E.configs.Difficulties.getList({})
  context.difficultySelected = itemData?.difficulty?.type || ''

  // Additional options
  const difficultyType = context.difficultyOptions[context.difficultySelected]
  context.showFixedDifficulty = difficultyType?.usesFixedValue ?? false
  context.showAttributeSelector = difficultyType?.usesAttribute ?? false

  return context
}

export async function prepareActivationContext(context, item) {
  const itemData = item.system

  // Tab data
  context.tab = context.tabs.activation

  // Activation dropdown
  context.activationOptions = WOD6E.configs.Activations.getList({})
  context.activationSelected = itemData?.activation?.activationType || ''

  // Distance dropdown
  context.distanceOptions = WOD6E.configs.Distances.getList({})
  context.distanceSelected = itemData?.activation?.distance || ''

  // Duration dropdown
  context.durationOptions = WOD6E.configs.Durations.getList({})
  context.durationSelected = itemData?.activation?.duration || ''

  // Cost type dropdown and cost amount input
  context.costTypeOptions = WOD6E.configs.CostTypes.getList({})
  context.costTypeSelected = itemData?.activation?.cost.type || ''

  context.costAmount = itemData?.activation?.cost.amount || 0

  return context
}

export const prepareItemSettingsContext = async function (context) {
  // Tab data
  context.tab = context.tabs.settings

  return context
}
