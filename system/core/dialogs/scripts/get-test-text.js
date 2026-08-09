export const _getTestText = function ({
  attributeOptions = [],
  skillOptions = [],
  disciplineOptions = []
}) {
  const selected = [...attributeOptions, ...skillOptions, ...disciplineOptions].filter(
    (option) => option.selected
  )

  if (!selected.length) {
    return game.i18n.localize('WOD6E.ROLL.NoTraitsSelected')
  }

  return selected.map((option) => option.label).join(' + ')
}

export const _getTestTextFromFormData = function (formData) {
  const getLabel = (definitions, key) => {
    const definition = definitions[key]

    return definition?.displayName ?? definition?.label ?? key
  }

  const attributes = WOD6E.configs.Attributes.getList({})
  const skills = WOD6E.configs.Skills.getList({})
  const disciplines = WOD6E.configs.Disciplines.getList({})

  const labels = [
    ...formData.attributes.map((key) => getLabel(attributes, key)),
    ...formData.skills.map((key) => getLabel(skills, key)),
    ...formData.disciplines.map((key) => getLabel(disciplines, key))
  ]

  if (!labels.length) {
    return game.i18n.localize('WOD6E.ROLL.NoTraitsSelected')
  }

  return labels.join(' + ')
}
