export class WOD6eRoll extends foundry.dice.Roll {
  /**
   * Create a WOD6E roll
   *
   * formulaOrPool accepts either a number (like 3) or a dicepool (like 3d10)
   *
   * @param {number} formulaOrPool
   * @param {object} data
   * @param {object} options
   */
  constructor(formulaOrPool = 0, data = {}, options = {}) {
    const isFormula = typeof formulaOrPool === 'string'

    const pool = isFormula
      ? Math.max(Number(options.dicePool) || 0, 0)
      : Math.max(Number(formulaOrPool) || 0, 0)

    const formula = isFormula ? formulaOrPool : `${pool}d10cs>=8`

    super(formula, data, options)

    this.options.dicePool ??= this.dice.reduce((total, die) => total + die.number, 0)

    this.options.baseDicePool ??= this.options.dicePool

    this.options.difficulty ??= 0
    this.options.basicSuccesses ??= 0

    this.options.automaticSuccess ??= false
    this.options.automaticFailure ??= false

    this.options.testType ??= 'standard'
    this.options.isAttack ??= false
    this.options.isDefense ??= false

    this.options.modifiers ??= []
    this.options.restrictions ??= []
  }

  // All results from d10s belonging to this roll
  get results() {
    return this.dice.flatMap((die) => die.results.filter((result) => result.active))
  }

  // Number of successes actually rolled on the dice
  get rolledSuccesses() {
    return this.results.filter((result) => result.result >= 8).length
  }

  // Number of guaranteed basic successes supplied by game effects
  // A basic success treats the test as having at least one success
  // but it doesn't generate extra successes by itself
  get basicSuccesses() {
    return Math.max(Number(this.options.basicSuccesses) || 0, 0)
  }

  // Basic successes establish a floor rather than being added
  // directly to rolled successes
  get successes() {
    if (this.automaticFailure) return 0

    if (this.automaticSuccess) {
      return Math.max(this.rolledSuccesses, 1)
    }

    return Math.max(this.rolledSuccesses, this.basicSuccesses)
  }

  // Number of successes beyond the first
  get extraSuccesses() {
    return Math.max(this.successes - 1, 0)
  }

  // Number of 1s rolled
  get ones() {
    return this.results.filter((result) => result.result === 1).length
  }

  // Number of 10s rolled, each 10 earns 1 Quickening
  get tens() {
    return this.results.filter((result) => result.result === 10).length
  }

  // Quickening earned directly from this roll
  get quickeningGained() {
    return this.tens
  }

  // Some success-determining logic; this is just whether the
  // test succeeded in general
  get isSuccess() {
    if (this.automaticFailure) return false
    if (this.automaticSuccess) return true

    return this.successes > 0
  }

  // Whether the test failed normally
  // Normal failure is no successes and no 1s
  get isFailure() {
    return !this.isSuccess && !this.isPainfulFailure
  }

  // Whether the test is a painful failure, which means
  // no successes and at least one 1 (1 one?)
  get isPainfulFailure() {
    if (this.automaticFailure) {
      return false
    }

    return this.successes === 0 && this.ones > 0
  }

  // Whether this roll can potentially use Devil's Bargain
  // Normal failure and no 1s rolled
  get canDevilsBargain() {
    return this.isFailure && !this.isPainfulFailure
  }

  // Whether the test qualifies for Overqualified
  // Overqualified uses the final dice pool after subtracting difficulty
  get isOverqualified() {
    return this.options.dicePool >= 4 && !this.options.isAttack && !this.options.isDefense
  }

  get automaticSuccess() {
    return Boolean(this.options.automaticSuccess)
  }

  get automaticFailure() {
    return Boolean(this.options.automaticFailure)
  }

  // Convenient representation for chat cards, callbacks, hooks, etc
  get result() {
    return {
      dicePool: this.options.dicePool,
      baseDicePool: this.options.baseDicePool,
      difficulty: this.options.difficulty,

      rolledSuccesses: this.rolledSuccesses,
      basicSuccesses: this.basicSuccesses,
      successes: this.successes,
      extraSuccesses: this.extraSuccesses,

      ones: this.ones,
      tens: this.tens,

      quickeningGained: this.quickeningGained,

      isSuccess: this.isSuccess,
      isFailure: this.isFailure,
      isPainfulFailure: this.isPainfulFailure,

      canDevilsBargain: this.canDevilsBargain,
      isOverqualified: this.isOverqualified,

      automaticSuccess: this.automaticSuccess,
      automaticFailure: this.automaticFailure,

      testType: this.options.testType,

      modifiers: this.options.modifiers,
      restrictions: this.options.restrictions
    }
  }

  // Restore a WOD6eRoll from serialized roll data
  static fromJSON(data) {
    const parsed = typeof data === 'string' ? JSON.parse(data) : data

    const roll = foundry.dice.Roll.fromData(parsed)

    Object.setPrototypeOf(roll, WOD6eRoll.prototype)

    return roll
  }
}
