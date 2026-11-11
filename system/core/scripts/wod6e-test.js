import { ActorEffects } from '../actors/scripts/actor-effects.js'
import { WOD6eRoll } from './wod6e-roll.js'
import { hasDifferentApproach } from './test-resolution.js'
import { getHunger, hasBeast } from '../actors/scripts/vitae.js'
import { getItemCost, withResourceSpend } from '../actors/scripts/resource-spending.js'
import { pendingTestUpdates } from './test-locks.js'

export class WOD6eTest {
  static async executeTest({
    actor,
    item = null,
    context,
    title = '',
    flavor = '',
    messageMode = game.settings.get('core', 'messageMode'),
    createMessage = true
  }) {
    const retrySource = context.retryOf ? game.messages.get(context.retryOf) : null
    if (context.retryOf) {
      const previous = retrySource?.rolls?.[0]
      if (
        !game.user.isGM ||
        !previous?.canRetry ||
        pendingTestUpdates.has(context.retryOf) ||
        retrySource.getFlag('wod6e', 'retryUsed') ||
        retrySource.speakerActor?.uuid !== actor?.uuid ||
        context.testType !== 'standard' ||
        context.difficulty !== previous.options.difficulty + 1 ||
        !hasDifferentApproach(previous.options, context)
      ) {
        throw new Error(game.i18n.localize('WOD6E.ROLL.RetryUnavailable'))
      }
    }
    if (retrySource) {
      messageMode = retrySource.blind ? 'blind' : retrySource.whisper.length ? 'gm' : 'public'
    }
    const test = {
      attribute: context.attributes,
      skill: context.skills,
      discipline: context.disciplines,
      action: context.action,
      category: context.category,
      conditionEffectIds: context.conditionEffectIds,
      dicePool: context.baseDicePool ?? context.dicePool,
      difficulty: context.difficulty
    }

    if (actor) {
      this.applyEffects(actor, test)
    }

    context.dicePool = Math.max(test.dicePool, 0)
    if (
      context.resolutionMode === 'takeHalf' &&
      actor?.type !== 'npc' &&
      (context.inConflict || context.isAttack || context.isDefense)
    ) {
      throw new Error(game.i18n.localize('WOD6E.ROLL.TakingHalfUnavailable'))
    }

    context.dicePoolText = game.i18n.format('WOD6E.ROLL.RollingString', {
      string: `${context.dicePool}d10`
    })

    const costItem = item ?? (context.itemUuid ? fromUuidSync(context.itemUuid) : null)
    return withResourceSpend(actor, getItemCost(costItem), async () => {
      // Re-read Vitae after paying the cost, including changes while the dialog was open.
      if (actor?.system?.vitae) context.hungerDice = getHunger(actor)
      if (actor?.system) context.hasBeast = hasBeast(actor)
      const roll = new WOD6eRoll(
        context.dicePool,
        {},
        {
          ...context
        }
      )

      // Consume the retry when it is actually attempted, not when its dialog opens.
      if (retrySource) {
        // Paying an item cost yields; the original may have changed in the meantime.
        if (
          !retrySource.rolls[0]?.canRetry ||
          retrySource.getFlag('wod6e', 'retryUsed') ||
          pendingTestUpdates.has(retrySource.id)
        ) {
          throw new Error(game.i18n.localize('WOD6E.ROLL.RetryUnavailable'))
        }
        pendingTestUpdates.add(retrySource.id)
        try {
          await retrySource.setFlag('wod6e', 'retryUsed', true)
        } finally {
          pendingTestUpdates.delete(retrySource.id)
        }
      }
      await roll.evaluate({ allowInteractive: messageMode !== 'blind' })

      if (createMessage) {
        const whisper = retrySource ? [...retrySource.whisper] : []
        if (whisper.length && !retrySource.blind && retrySource.author?.id) {
          whisper.push(retrySource.author.id)
        }
        await roll.toMessage(
          {
            speaker: ChatMessage.getSpeaker({ actor }),
            title,
            flavor,
            ...(retrySource ? { whisper: [...new Set(whisper)], blind: retrySource.blind } : {})
          },
          {
            messageMode
          }
        )
      }

      return roll
    })
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
