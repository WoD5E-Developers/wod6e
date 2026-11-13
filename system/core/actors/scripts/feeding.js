import { generateVitaeMax, hasBeast } from './vitae.js'
import { getActivePath, markViolations } from '../../../splats/vampire/scripts/humanity.js'

export async function feedActor(actor, { amount, killedHuman = false, endangeredHuman = false }) {
  if (!actor?.isOwner || !actor.system.vitae || !Number.isInteger(amount) || amount < 1) {
    throw new Error(game.i18n.localize('WOD6E.RESOURCES.InvalidFeeding'))
  }
  const previousVitae = actor.system.vitae.value
  const previousWillpower = actor.system.willpower?.value ?? 0
  const restoresWillpower = killedHuman && hasBeast(actor) && actor.system.willpower
  const update = {
    'system.vitae.value': Math.min(generateVitaeMax(actor), previousVitae + amount)
  }
  if (restoresWillpower) {
    update['system.willpower.value'] = Math.min(actor.system.willpower.max, previousWillpower + 1)
  }
  if (
    hasBeast(actor) &&
    actor.system.vampire?.humanity &&
    getActivePath(actor).system.pathType === 'humanity' &&
    (killedHuman || endangeredHuman)
  ) {
    const humanity = markViolations(actor.system.vampire.humanity, killedHuman ? 2 : 1)
    update['system.vampire.humanity.value'] = humanity.value
    update['system.vampire.humanity.violations'] = humanity.violations
  }
  await actor.update(update)

  const content = document.createElement('p')
  content.textContent = game.i18n.format('WOD6E.RESOURCES.FeedingVitaeRestored', {
    character: actor.name,
    number: Math.max(0, actor.system.vitae.value - previousVitae)
  })
  if (restoresWillpower) {
    content.append(
      ` ${game.i18n.format('WOD6E.RESOURCES.FeedingWillpowerRestored', {
        number: Math.max(0, actor.system.willpower.value - previousWillpower)
      })}`
    )
  }
  try {
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: content.outerHTML
    })
  } catch (error) {
    // Feeding is already saved; close the dialog rather than offering to award it again.
    ui.notifications.warn(error.message)
  }
}

export async function _onFeed(event) {
  event.preventDefault()
  const actor = this.actor
  if (!actor.isOwner || !actor.system.vitae) return
  const localize = (key) => game.i18n.localize(`WOD6E.RESOURCES.${key}`)
  const beast = hasBeast(actor)
  const content = document.createElement('div')
  content.innerHTML = await foundry.applications.handlebars.renderTemplate(
    'systems/wod6e/templates/core/dialogs/feed.hbs',
    { hasBeast: beast, isHumanity: beast && getActivePath(actor).system.pathType === 'humanity' }
  )
  return foundry.applications.api.DialogV2.wait({
    window: { title: localize('Feed') },
    content,
    form: { closeOnSubmit: false },
    buttons: [
      {
        action: 'feed',
        label: localize('Feed'),
        default: true,
        callback: async (_event, button, dialog) => {
          if (!button.form.reportValidity()) return false
          try {
            await feedActor(actor, {
              amount: button.form.elements.amount.valueAsNumber,
              killedHuman: button.form.elements.killedHuman?.checked ?? false,
              endangeredHuman: button.form.elements.endangeredHuman?.checked ?? false
            })
            await dialog.close()
            return true
          } catch (error) {
            ui.notifications.warn(error.message)
            return false
          }
        }
      },
      {
        action: 'cancel',
        type: 'button',
        label: game.i18n.localize('WOD6E.Cancel'),
        callback: (_event, _button, dialog) => dialog.close()
      }
    ],
    rejectClose: false
  })
}
