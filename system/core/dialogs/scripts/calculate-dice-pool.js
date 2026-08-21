export const _calculateDicePool = function (actor, formData) {
  const attributeDice = formData.attributes.reduce((total, key) => {
    return total + foundry.utils.getProperty(actor, `${key}.effective`)
  }, 0)

  const skillDice = formData.skills.reduce((total, key) => {
    return total + foundry.utils.getProperty(actor, `${key}.effective`)
  }, 0)

  const disciplineDice = formData.disciplines.reduce((total, key) => {
    return total + foundry.utils.getProperty(actor, `${key}.effective`)
  }, 0)

  const customModifier = formData.customModifier ?? 0
  const itemModifier = formData.itemModifier ?? 0
  const focusModifier = formData.focus ? 1 : 0
  const difficulty = formData.difficulty ?? 0

  // Enforce a minimum of 1 die
  return Math.max(
    1,
    attributeDice +
      skillDice +
      disciplineDice +
      itemModifier +
      customModifier +
      focusModifier -
      difficulty
  )
}
