import { getActivePath, getHumanityRank, markViolations } from '../../../scripts/humanity.js'
import { createPathItemData } from '../../../scripts/paths.js'

const pending = new Set()

async function updateHumanity(actor, operation) {
  if (!actor.isOwner || pending.has(actor.uuid)) return
  pending.add(actor.uuid)
  try {
    const changes = operation(actor.system.vampire.humanity)
    if (changes)
      await actor.update(
        Object.fromEntries(
          Object.entries(changes).map(([key, value]) => [`system.vampire.humanity.${key}`, value])
        )
      )
  } catch (error) {
    ui.notifications.warn(error.message)
  } finally {
    pending.delete(actor.uuid)
  }
}

export async function _onHumanityRank(_event, target) {
  const rank = Number(target.dataset.value)
  if (!Number.isInteger(rank) || rank < 0 || rank > 10) return
  return updateHumanity(this.actor, (current) => {
    if (rank > getHumanityRank(this.actor) && current.violations > 0) {
      throw new Error(game.i18n.localize('WOD6E.VAMPIRE.ClearViolationsFirst'))
    }
    return { value: rank, violations: rank === 0 ? 0 : Math.min(current.violations, 10 - rank) }
  })
}

export async function _onMarkViolations() {
  const actor = this.actor
  if (!actor.isOwner || getHumanityRank(actor) === 0) return

  const amount = await foundry.applications.api.DialogV2.wait({
    window: { title: game.i18n.localize('WOD6E.VAMPIRE.MarkViolations') },
    content: `<p>${game.i18n.localize('WOD6E.VAMPIRE.ViolationHint')}</p>`,
    buttons: [1, 2, 3].map((count) => ({
      action: `mark-${count}`,
      label: String(count),
      default: count === 1,
      callback: () => count
    })),
    rejectClose: false
  })
  if (!amount) return
  return updateHumanity(actor, (current) => markViolations(current, amount))
}

export async function _onEraseViolation() {
  return updateHumanity(this.actor, (current) => ({
    violations: Math.max(0, current.violations - 1)
  }))
}

export async function _onOpenPath() {
  let path = getActivePath(this.actor)
  if (!path.sheet && this.actor.isOwner) {
    const created = await this.actor.createEmbeddedDocuments('Item', [createPathItemData()])
    path = created[0]
  }
  return path.sheet?.render(true)
}
