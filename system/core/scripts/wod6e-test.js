import { ActorEffects } from '../actors/scripts/actor-effects.js'
import { WOD6eRoll } from './wod6e-roll.js'

export class WOD6eTest {
  static async executeTest({
    actor,
    context,
    title = '',
    flavor = '',
    messageMode = game.settings.get('core', 'messageMode'),
    createMessage = true
  }) {
    const test = {
      attribute: context.attributes,
      skill: context.skills,
      discipline: context.disciplines,
      action: context.action,
      category: context.category,
      conditionEffectIds: context.conditionEffectIds,
      quickeningSpent: Math.max(Math.floor(Number(context.quickeningSpent) || 0), 0),
      dicePool: context.baseDicePool ?? context.dicePool,
      difficulty: context.difficulty
    }

    if (actor) {
      this.applyEffects(actor, test)
    }

    // Each Quickening spent contributes one die to the roll.
    test.dicePool += test.quickeningSpent
    context.quickeningSpent = test.quickeningSpent

    context.dicePool = test.dicePool
    context.dicePoolText = game.i18n.format('WOD6E.ROLL.RollingString', {
      string: `${test.dicePool}d10`
    })

    const roll = new WOD6eRoll(
      context.dicePool,
      {},
      {
        ...context
      }
    )

    await roll.evaluate()

    if (actor) {
      await this._processRollEffects(actor, roll)
    }

    if (createMessage) {
      await roll.toMessage(
        {
          speaker: ChatMessage.getSpeaker({ actor }),
          title,
          flavor
        },
        {
          messageMode
        }
      )
    }

    return roll
  }

  static async _processRollEffects(actor, roll) {
    await this._processQuickening(actor, roll)
  }

  static async _processQuickening(actor, roll) {
    const user = game.user

    if (user.character?.id !== actor.id) return

    // If you see this and think, "Why not combine these?"
    // it's because later on we check if the quickening value hasn't changed at all
    // and we can get weird scenarios where quickening is spent, and gained,
    // by the same amount in the same roll, but we want to tell the users about this
    // and instead of trying to figure out the chat message template for it
    // we just send two chat messages one after the other for ease
    if (roll?.quickeningSpent > 0)
      Hooks.callAll('wod6e.adjustQuickening', user, -roll.quickeningSpent)

    if (roll?.quickeningGained > 0)
      Hooks.callAll('wod6e.adjustQuickening', user, roll?.quickeningGained)
  }

  static applyEffects(actor, test) {
    const selectedEffectIds = Array.isArray(test.conditionEffectIds)
      ? new Set(test.conditionEffectIds)
      : null
    const effects = selectedEffectIds
      ? (actor.preparedEffects?.effects ?? []).filter(
          (effect) => effect.type === 'dice' && selectedEffectIds.has(effect.effectId)
        )
      : ActorEffects.getApplicableEffects(actor, test, { types: 'dice' })

    for (const effect of effects) {
      test.dicePool = ActorEffects.applyNumericEffect(test.dicePool, effect, actor)
    }
  }
}
