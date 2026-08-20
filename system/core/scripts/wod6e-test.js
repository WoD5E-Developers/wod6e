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
      dicePool: context.baseDicePool ?? context.dicePool,
      difficulty: context.difficulty
    }

    if (actor) {
      this.applyEffects(actor, test)
    }

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
    const amount = roll.quickeningGained
    if (amount <= 0) return

    const user = game.user

    if (user.character?.id !== actor.id) return

    Hooks.callAll('wod6e.increaseQuickening', user, amount)
  }

  static applyEffects(actor, test) {
    const effects = ActorEffects.getApplicableEffects(actor, test, { types: 'dice' })

    for (const effect of effects) {
      test.dicePool = ActorEffects.applyNumericEffect(test.dicePool, effect, actor)
    }
  }
}
