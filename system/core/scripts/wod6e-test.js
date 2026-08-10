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

    console.log(`Gained ${amount} Quickening`)
  }
}
