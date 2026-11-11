export const _calculateDicePool = function (actor, formData, { clamp = true } = {}) {
  let traitDice = 0
  for (const [group, mode] of [
    ['attributes', 'attributeMode'],
    ['skills', 'skillMode'],
    ['disciplines', 'disciplineMode']
  ]) {
    const selected = Array.from(new Set(formData[group] ?? []))
    if (formData[mode] === 'any' && selected.length > 1) {
      throw new Error(game.i18n.localize('WOD6E.ROLL.ChooseOneTrait'))
    }
    traitDice += selected.reduce((total, key) => {
      return total + (Number(foundry.utils.getProperty(actor, `${key}.effective`)) || 0)
    }, 0)
  }

  // Difficulty is a success target, never a dice modifier. Zero dice is allowed.
  const pool =
    traitDice +
    (Number(formData.itemModifier) || 0) +
    (Number(formData.customModifier) || 0) +
    (formData.focus ? 1 : 0)
  return clamp ? Math.max(pool, 0) : Math.floor(pool)
}
