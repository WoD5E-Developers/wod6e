export const _getTestText = function ({
  attributeOptions = [],
  skillOptions = [],
  disciplineOptions = [],
  customModifier = 0,
  effects = [],
  includeDifficulty = true,
  difficulty = 0
}) {
  const selected = [...attributeOptions, ...skillOptions, ...disciplineOptions].filter(
    (option) => option.selected
  )

  const testText = selected.length
    ? selected.map((option) => `${option.label} (${option.value})`).join(' + ')
    : game.i18n.localize('WOD6E.ROLL.NoTraitsSelected')

  const modifierText = customModifier
    ? ` ${customModifier > 0 ? '+' : '-'} ${Math.abs(customModifier)}`
    : ''

  const effectText = effects.map((effect) => ` + ${effect.name} (${effect.modifier})`).join('')
  const difficultyText = includeDifficulty
    ? ` ${game.i18n.localize('WOD6E.ROLL.VsDifficulty')} (${difficulty})`
    : ''

  return `${testText}${modifierText}${effectText}${difficultyText}`
}
