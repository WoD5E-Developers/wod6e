import { createPathItemData } from './paths.js'
import { hasBeast } from '../../../core/actors/scripts/vitae.js'

export function getHumanityRank(actor) {
  const value = actor?.system?.vampire?.humanity?.value ?? (actor?.type === 'npc' ? 6 : 0)
  return Math.max(0, Math.min(10, Math.floor(Number(value) || 0)))
}

export function getHumanityModifier(rank) {
  if (rank >= 10) return 2
  if (rank >= 8) return 1
  if (rank >= 4 || rank <= 0) return 0
  return rank >= 2 ? -1 : -2
}

export function getActivePath(actor) {
  return actor?.items?.find((item) => item.type === 'path') ?? createPathItemData()
}

export function getTorporDuration(rank) {
  if (rank >= 10) return ['OneDay', 'OneWeek']
  if (rank >= 8) return ['OneWeek', 'OneMonth']
  if (rank >= 4) return ['OneMonth', 'OneYear']
  if (rank >= 2) return ['OneYear', 'OneDecade']
  return rank === 1 ? ['OneDecade', 'OneCentury'] : null
}

// One assessed violation can mark 1-3 boxes. Reaching a filled box loses one rank
// and clears the entire assessment, rather than carrying marks into the new rank.
export function markViolations(humanity, amount) {
  if (!Number.isInteger(amount) || amount < 1 || amount > 3)
    throw new Error('Invalid violation count')
  const value = Math.max(0, Math.min(10, humanity.value))
  const violations = Math.max(0, humanity.violations ?? 0) + amount
  if (value === 0) return { value: 0, violations: 0 }
  return violations > 10 - value ? { value: value - 1, violations: 0 } : { value, violations }
}

// Apply after ordinary modifiers and conditions, before substituting Hunger dice.
export function applyHumanityRules(actor, test) {
  if (!hasBeast(actor) || !actor.system?.vampire?.humanity) return
  const rank = getHumanityRank(actor)
  const resistance = Boolean(test.resistBeast || test.frenzyType)
  const teachings = resistance && getActivePath(actor).system.resistanceTeaching
  const modifier = test.humanityModifier || teachings ? getHumanityModifier(rank) : 0
  test.humanityAdjustment = modifier
  test.dicePool += modifier
  test.humanityCap = resistance ? rank : null
  if (resistance) test.dicePool = Math.min(test.dicePool, rank)
}

// TypeDataModel migration also runs on imported actors and unlinked token data.
export function migrateHumanityData(source) {
  const vampire = source.vampire
  if (!vampire || vampire.humanity?.rulesVersion === 2) return source
  const legacy = vampire.nature || vampire.beast || vampire.humanity?.max === 7
  if (!legacy) return source
  const humanity = vampire.humanity
  // Some previously migrated actors saved rank and violations without the new schema fields.
  const hasAlpha2Violations = Number.isInteger(humanity?.violations)
  vampire.humanity = {
    value: hasAlpha2Violations ? (humanity.value ?? 6) : 6,
    max: 10,
    violations: hasAlpha2Violations ? humanity.violations : 0,
    rulesVersion: 2,
    legacy: { humanity: vampire.humanity, nature: vampire.nature, beast: vampire.beast }
  }
  delete vampire.nature
  delete vampire.beast
  return source
}

export async function initializeHumanityPaths() {
  if (!game.user.isGM || game.users.activeGM?.id !== game.user.id) return
  const actors = new Map(game.actors.contents.map((actor) => [actor.uuid, actor]))
  for (const scene of game.scenes) {
    for (const token of scene.tokens) {
      if (!token.actorLink && token.actor) actors.set(token.actor.uuid, token.actor)
    }
  }
  for (const actor of actors.values()) {
    if (actor.type !== 'vampire') continue
    if (actor.getFlag('wod6e', 'humanityAlpha2') !== 2) {
      const { ForcedDeletion } = foundry.data.operators
      // The client already sees migrated values. Send the entire tracker to persist them.
      await actor.update(
        {
          'system.vampire.humanity': actor.toObject().system.vampire.humanity,
          'system.vampire.nature': new ForcedDeletion(),
          'system.vampire.beast': new ForcedDeletion(),
          'flags.wod6e.humanityAlpha2': 2
        },
        { diff: false }
      )
    }
    if (!actor.items.some((item) => item.type === 'path')) {
      await actor.createEmbeddedDocuments('Item', [createPathItemData()])
    }
  }
}
