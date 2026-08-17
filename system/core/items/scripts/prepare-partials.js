import { prepareMultiSelect } from '../../fields/multiselect.js'
import { buildEnrichedField } from './build-enriched-field.js'
import { formatTest } from './format-test-labels.js'
import { getTargetOptions } from './get-target-options.js'

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
  const attributes = prepareMultiSelect(
    test?.attributes,
    getTargetOptions({ types: ['attributes'] })
  )

  // Skills
  const skills = prepareMultiSelect(test?.skills, getTargetOptions({ types: ['skills'] }))

  // Disciplines
  const disciplines = prepareMultiSelect(
    test?.disciplines,
    getTargetOptions({ types: ['disciplines'] })
  )

  context.test = {
    description: test.description ?? '',

    attributeOptions: attributes.options,
    selectedAttributesText: attributes.selectedText,

    skillOptions: skills.options,
    selectedSkillsText: skills.selectedText,

    disciplineOptions: disciplines.options,
    selectedDisciplinesText: disciplines.selectedText,

    testText: formatTest(attributes.labels, skills.labels, disciplines.labels)
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
