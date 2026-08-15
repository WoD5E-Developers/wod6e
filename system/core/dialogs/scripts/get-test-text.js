export const _getTestText = function ({
  attributeOptions = [],
  skillOptions = [],
  disciplineOptions = [],
  customModifier = 0
}) {
  const selected = [...attributeOptions, ...skillOptions, ...disciplineOptions].filter(
    (option) => option.selected
  )

  if (!selected.length) {
    return game.i18n.localize('WOD6E.ROLL.NoTraitsSelected')
  }

  const testText = selected.map((option) => option.label).join(' + ')

  const modifierText = customModifier
    ? ` ${customModifier > 0 ? '+' : '-'} ${Math.abs(customModifier)}`
    : ''

  return `${testText}${modifierText}`
}
