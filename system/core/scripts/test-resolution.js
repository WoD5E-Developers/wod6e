// Count number of successes returned for a role
export function countSuccesses(results) {
  return results.reduce((total, die) => {
    if (!die.active) return total
    return total + (die.result === 10 ? 2 : die.result >= 6 ? 1 : 0)
  }, 0)
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
