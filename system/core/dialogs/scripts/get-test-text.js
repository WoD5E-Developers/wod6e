export const _getTestText = function ({
  npcPool = null,
  attributeOptions = [],
  skillOptions = [],
  disciplineOptions = [],
  specialty = '',
  customModifier = 0,
  effects = [],
  includeDifficulty = true,
  difficulty = 1,
  testType = 'standard'
}) {
  const selected = [...attributeOptions, ...skillOptions, ...disciplineOptions].filter(
    (option) => option.selected
  )

  const testParts = (npcPool ? [npcPool] : selected).map(
    (option) => `${option.label} (${option.value})`
  )
  if (specialty) testParts.push(`${specialty} (1)`)

  const testText = testParts.length
    ? testParts.join(' + ')
    : game.i18n.localize('WOD6E.ROLL.NoTraitsSelected')

  const modifierText = customModifier
    ? ` ${customModifier > 0 ? '+' : '-'} ${Math.abs(customModifier)}`
    : ''

  const effectText = effects.map((effect) => ` + ${effect.name} (${effect.modifier})`).join('')
  const difficultyText =
    !includeDifficulty || testType !== 'standard'
      ? ''
      : ` ${game.i18n.localize('WOD6E.ROLL.VsDifficulty')} (${difficulty})`

  return `${testText}${modifierText}${effectText}${difficultyText}`
}
