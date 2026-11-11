// Count successes from active dice; a 10 counts twice.
export function countSuccesses(results) {
  return results.reduce((total, die) => {
    if (!die.active) return total
    return total + (die.result === 10 ? 2 : die.result >= 6 ? 1 : 0)
  }, 0)
}

// PG 97–98, 103; ST 14. Painful and bestial failure can occur together.
export function classifyFailure(successes, options, { hungerOnes = 0, hasDice = true } = {}) {
  const failed = resolveTest(successes, options).isSuccess === false
  const automatic = options.automaticFailure || options.dicePool === 0
  const isPainfulFailure =
    failed && (Boolean(options.retryOf) || (!automatic && hasDice && successes === 0))
  const isBestialFailure = failed && !automatic && hungerOnes > 0
  const isFailure = failed && !isPainfulFailure && !isBestialFailure
  const canBeastsBargain =
    isFailure &&
    !automatic &&
    options.hasBeast === true &&
    options.bargainRule !== 'forbidden' &&
    !options.beastsBargain?.accepted &&
    !options.retryOf

  return { isFailure, isPainfulFailure, isBestialFailure, canBeastsBargain }
}

// A retry is a new attempt, not a reroll of the same pool (PG 98).
export function hasDifferentApproach(previous, next) {
  return ['attributes', 'skills'].some((group) => {
    const before = new Set(previous[group] ?? [])
    const after = new Set(next[group] ?? [])
    return [...after].some((trait) => !before.has(trait))
  })
}

// Resolve what the outcome of the test is
// Accomodates automatic failures and calculates margins
export function resolveTest(successes, options) {
  const difficulty = Math.max(options.difficulty, 0)
  const unopposed = (options.testType ?? 'standard') !== 'standard'
  const automaticFailure = options.automaticFailure || Math.max(options.dicePool, 0) === 0
  let isSuccess = null

  if (automaticFailure) isSuccess = false
  else if (!unopposed) isSuccess = successes >= difficulty

  const margin = unopposed ? null : successes - difficulty
  return {
    isResolved: isSuccess !== null,
    isSuccess,
    margin,
    marginOfSuccess: isSuccess === true ? Math.max(0, margin ?? 0) : 0,
    marginOfFailure: isSuccess === false ? Math.max(0, -(margin ?? 0)) : 0
  }
}
