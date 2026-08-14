import { formatTest } from './format-test-labels.js'

export const generateTestTextFromItem = function (item) {
  const test = item.system.test

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

  return formatTest(selectedAttributeLabels, selectedSkillLabels, selectedDisciplineLabels)
}
