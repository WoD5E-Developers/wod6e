export const _getTestText = function ({
  attributeOptions = [],
  skillOptions = [],
  disciplineOptions = [],
  quickeningSpent = 0,
  customModifier = 0,
  effects = [],
  includeDifficulty = true,
  difficulty = 0
}) {
  const selected = [...attributeOptions, ...skillOptions, ...disciplineOptions].filter(
    (option) => option.selected
  )

  const testParts = selected.map((option) => `${option.label} (${option.value})`)

  if (quickeningSpent > 0) {
    testParts.push(`${game.i18n.localize('WOD6E.RESOURCES.Quickening')} (${quickeningSpent})`)
  }

  const testText = testParts.length
    ? testParts.join(' + ')
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
