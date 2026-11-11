import { countSuccesses, resolveTest } from './test-resolution.js'

export class WOD6eRoll extends foundry.dice.Roll {
  static CHAT_TEMPLATE = 'systems/wod6e/templates/core/chat/test-roll.hbs'

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

    const pool = Math.max(isFormula ? options.dicePool : formulaOrPool)
    const takeHalf = options.resolutionMode === 'takeHalf'
    const formula = isFormula
      ? formulaOrPool
      : takeHalf
        ? String(Math.ceil(pool / 2))
        : pool > 0
          ? `${pool}d10cs>=6`
          : '0'

    super(formula, data, options)

    this.options.resolutionVersion ??= 2
    this.options.dicePool ??= isFormula
      ? this.dice.reduce((total, die) => total + die.number, 0)
      : pool
    this.options.dicePool = Math.max(this.options.dicePool, 0)

    this.options.baseDicePool ??= this.options.dicePool

    this.options.difficulty = Math.max(this.options.difficulty ?? 1, 0)
    this.options.resolutionMode ??= 'roll'
    this.options.basicSuccesses ??= 0
    this.options.quickeningSpent ??= 0

    this.options.automaticFailure ??= false

    this.options.testType ??= 'standard'
    this.options.isAttack ??= false
    this.options.isDefense ??= false

    this.options.modifiers ??= []
    this.options.restrictions ??= []

    // Formula callers must also avoid rolling dice when Taking Half or automatically
    // failing. The parsed formula supplies the pool when none was provided.
    if (
      isFormula &&
      this.options.resolutionVersion === 2 &&
      this.dice.length &&
      (takeHalf || this.automaticFailure)
    ) {
      this.terms = this.constructor.parse(String(this.successes), data)
      this._formula = this.resetFormula()
    }
  }

  async _evaluate(options = {}) {
    await super._evaluate(options)
    this._scoreDice()
    return this
  }

  _evaluateSync(options = {}) {
    super._evaluateSync(options)
    this._scoreDice()
    return this
  }

  _scoreDice() {
    // Keep Foundry's total, serialized dice, and tooltip totals in agreement.
    for (const die of this.dice.filter((die) => die.faces === 10)) {
      for (const result of die.results) {
        result.count = result.result === 10 ? 2 : result.result >= 6 ? 1 : 0
        result.success = result.count > 0
      }
    }
    this._total = this.successes
  }

  // All results from d10s belonging to this roll
  get results() {
    return this.dice
      .filter((die) => die.faces === 10)
      .flatMap((die) => die.results.filter((result) => result.active))
  }

  // Number of successes actually rolled on the dice
  get rolledSuccesses() {
    return countSuccesses(this.results)
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
    if (this.options.resolutionMode === 'takeHalf') return Math.ceil(this.options.dicePool / 2)
    return Math.max(this.rolledSuccesses, this.basicSuccesses)
  }

  // Compatibility alias for effects which previously used "extra successes".
  get extraSuccesses() {
    return this.marginOfSuccess
  }

  get resolution() {
    return resolveTest(this.successes, this.options)
  }

  get marginOfSuccess() {
    return this.resolution.marginOfSuccess
  }

  get marginOfFailure() {
    return this.resolution.marginOfFailure
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

  // Quickening spent to improve this roll
  get quickeningSpent() {
    return Math.max(Number(this.options.quickeningSpent) || 0, 0)
  }

  // Some success-determining logic; this is just whether the
  // test succeeded in general
  get isSuccess() {
    return this.resolution.isSuccess
  }

  // The failure categories are retained until the separate failure-rules update.
  get isFailure() {
    return this.isSuccess === false && !this.isPainfulFailure
  }

  // Whether the test is a painful failure, which means
  // no successes and at least one 1 (1 one?)
  get isPainfulFailure() {
    if (this.automaticFailure || this.isSuccess !== false) {
      return false
    }

    return this.successes === 0 && this.ones > 0
  }

  // Whether this roll can potentially use Devil's Bargain
  // Normal failure and no 1s rolled
  get canDevilsBargain() {
    return !this.automaticFailure && this.isFailure && !this.isPainfulFailure
  }

  get automaticFailure() {
    return Boolean(this.options.automaticFailure) || this.options.dicePool === 0
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
      ...this.resolution,

      ones: this.ones,
      tens: this.tens,

      quickeningGained: this.quickeningGained,
      quickeningSpent: this.quickeningSpent,

      isSuccess: this.isSuccess,
      isFailure: this.isFailure,
      isPainfulFailure: this.isPainfulFailure,

      canDevilsBargain: this.canDevilsBargain,
      automaticFailure: this.automaticFailure,

      testType: this.options.testType,

      modifiers: this.options.modifiers,
      restrictions: this.options.restrictions
    }
  }

  async _prepareChatRenderContext(options = {}) {
    const context = await super._prepareChatRenderContext(options)
    // Historical messages retain their stored totals and do not acquire new outcomes.
    if (options.isPrivate || this.options.resolutionVersion !== 2) return context

    const resolution = this.resolution
    const unopposed = this.options.testType !== 'standard'
    const outcomeLabel =
      !unopposed && resolution.isResolved
        ? game.i18n.format(`WOD6E.ROLL.${resolution.isSuccess ? 'SuccessBy' : 'FailureBy'}`, {
            margin: resolution.isSuccess ? resolution.marginOfSuccess : resolution.marginOfFailure
          })
        : null
    return {
      ...context,
      formula:
        this.options.resolutionMode === 'takeHalf'
          ? game.i18n.format('WOD6E.ROLL.TakingHalfPool', { pool: this.options.dicePool })
          : context.formula,
      resolution: {
        ...resolution,
        outcomeLabel,
        automaticFailure: this.automaticFailure,
        unopposed,
        difficulty: this.options.difficulty
      }
    }
  }

  static fromData(data) {
    return super.fromData({
      ...data,
      options: { ...data.options, resolutionVersion: data.options?.resolutionVersion ?? 1 }
    })
  }

  static fromJSON(data) {
    return this.fromData(typeof data === 'string' ? JSON.parse(data) : data)
  }
}
