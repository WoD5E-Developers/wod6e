import { classifyFailure, countSuccesses, resolveTest } from './test-resolution.js'

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

    const pool = Math.max(Math.floor(Number(isFormula ? options.dicePool : formulaOrPool) || 0), 0)
    const hunger = Math.min(pool, Math.max(0, Math.floor(Number(options.hungerDice) || 0)))
    const diceFormula = [
      pool > hunger ? `${pool - hunger}d10cs>=6` : '',
      hunger ? `${hunger}d10cs>=6[Hunger]` : ''
    ]
      .filter(Boolean)
      .join(' + ')
    const takeHalf = options.resolutionMode === 'takeHalf'
    const formula = isFormula
      ? formulaOrPool
      : takeHalf
        ? String(Math.ceil(pool / 2))
        : pool > 0
          ? diceFormula
          : '0'

    super(formula, data, options)

    this.options.resolutionVersion ??= 2
    this.options.failureRulesVersion ??= 2
    this.options.hungerDice ??= hunger
    this.options.dicePool ??= isFormula
      ? this.dice.reduce((total, die) => total + die.number, 0)
      : pool
    this.options.dicePool = Math.max(this.options.dicePool, 0)

    this.options.baseDicePool ??= this.options.dicePool

    this.options.difficulty = Math.max(this.options.difficulty ?? 1, 0)
    this.options.resolutionMode ??= 'roll'
    this.options.basicSuccesses ??= 0
    this.options.hasBeast ??= false
    this.options.bargainRule ??= 'standard'

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

  async getTooltip() {
    const parts = this.dice.map((die) => {
      const part = die.getTooltipData()
      if (die.options.hunger || die.options.flavor === 'Hunger') {
        part.flavor = game.i18n.localize('WOD6E.ROLL.HungerDice')
        part.rolls = part.rolls.map((roll) => ({
          ...roll,
          classes: `${roll.classes} wod6e-hunger-die`
        }))
      }
      return part
    })
    return foundry.applications.handlebars.renderTemplate(this.constructor.TOOLTIP_TEMPLATE, {
      parts
    })
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
    const resolution = resolveTest(this.successes, this.options)
    if (!this.options.beastsBargain?.accepted) return resolution
    return {
      ...resolution,
      isSuccess: true,
      isResolved: true,
      margin: 0,
      marginOfSuccess: 0,
      marginOfFailure: 0
    }
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

  // Number of 10s rolled
  get tens() {
    return this.results.filter((result) => result.result === 10).length
  }

  get hungerOnes() {
    return this.dice
      .filter((die) => die.faces === 10 && (die.options.hunger || die.options.flavor === 'Hunger'))
      .flatMap((die) => die.results)
      .filter((result) => result.active && result.result === 1).length
  }

  // Some success-determining logic; this is just whether the
  // test succeeded in general
  get isSuccess() {
    return this.resolution.isSuccess
  }

  get failure() {
    return classifyFailure(this.successes, this.options, {
      hungerOnes: this.hungerOnes,
      hasDice: this.results.length > 0
    })
  }

  get isFailure() {
    return !this.options.beastsBargain?.accepted && this.failure.isFailure
  }

  // Zero successes, or any failed retry. Ordinary 1s are irrelevant.
  get isPainfulFailure() {
    return this.failure.isPainfulFailure
  }

  get isBestialFailure() {
    return this.failure.isBestialFailure
  }

  get canBeastsBargain() {
    return this.options.failureRulesVersion === 2 && this.failure.canBeastsBargain
  }

  get canRetry() {
    return (
      this.options.failureRulesVersion === 2 &&
      this.options.testType === 'standard' &&
      this.isSuccess === false &&
      !this.options.retryOf
    )
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

      isSuccess: this.isSuccess,
      isFailure: this.isFailure,
      isPainfulFailure: this.isPainfulFailure,

      isBestialFailure: this.isBestialFailure,
      hungerOnes: this.hungerOnes,
      canBeastsBargain: this.canBeastsBargain,
      canRetry: this.canRetry,
      beastsBargain: this.options.beastsBargain ?? null,
      retryOf: this.options.retryOf ?? null,
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
    let outcomeLabel =
      !unopposed && resolution.isResolved
        ? game.i18n.format(`WOD6E.ROLL.${resolution.isSuccess ? 'SuccessBy' : 'FailureBy'}`, {
            margin: resolution.isSuccess ? resolution.marginOfSuccess : resolution.marginOfFailure
          })
        : null
    const currentFailures = this.options.failureRulesVersion === 2
    if (currentFailures && this.options.beastsBargain?.accepted) {
      outcomeLabel = game.i18n.localize('WOD6E.ROLL.BeastsBargainWin')
    }
    return {
      ...context,
      formula:
        this.options.resolutionMode === 'takeHalf'
          ? game.i18n.format('WOD6E.ROLL.TakingHalfPool', { pool: this.options.dicePool })
          : context.formula,
      resolution: {
        ...resolution,
        outcomeLabel,
        isPainfulFailure: currentFailures && this.isPainfulFailure,
        isBestialFailure: currentFailures && this.isBestialFailure,
        isRetry: currentFailures && Boolean(this.options.retryOf),
        bargainCost: currentFailures ? this.options.beastsBargain?.cost : null,
        automaticFailure: this.automaticFailure,
        unopposed,
        difficulty: this.options.difficulty
      }
    }
  }

  static fromData(data) {
    return super.fromData({
      ...data,
      options: {
        ...data.options,
        resolutionVersion: data.options?.resolutionVersion ?? 1,
        failureRulesVersion: data.options?.failureRulesVersion ?? 1
      }
    })
  }

  static fromJSON(data) {
    return this.fromData(typeof data === 'string' ? JSON.parse(data) : data)
  }
}
