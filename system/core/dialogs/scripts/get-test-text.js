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
