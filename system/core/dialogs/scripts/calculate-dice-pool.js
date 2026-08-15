export const _calculateDicePool = function (actor, formData) {
  const attributeDice = formData.attributes.reduce((total, key) => {
    return total + Number(actor.system?.attributes?.[key]?.value ?? 0)
  }, 0)

  const skillDice = formData.skills.reduce((total, key) => {
    return total + Number(actor.system?.skills?.[key]?.value ?? 0)
  }, 0)

  const disciplineDice = formData.disciplines.reduce((total, key) => {
    return total + Number(actor.system?.vampire?.disciplines?.[key]?.value ?? 0)
  }, 0)

  const customModifier = formData.customModifier ?? 0

  // Enforce a minimum of 1 die
  return Math.max(1, attributeDice + skillDice + disciplineDice + customModifier)
}
