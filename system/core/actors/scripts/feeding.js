import { generateVitaeMax, hasBeast } from './vitae.js'

export async function feedActor(actor, { amount, killedHuman = false }) {
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
  const content = document.createElement('div')
  const amountLabel = document.createElement('label')
  amountLabel.className = 'form-group'
  amountLabel.textContent = localize('VitaeGained')
  const input = document.createElement('input')
  Object.assign(input, {
    type: 'number',
    name: 'amount',
    min: '1',
    step: '1',
    value: '1',
    required: true
  })
  amountLabel.append(input)
  content.append(amountLabel)
  if (hasBeast(actor)) {
    const label = document.createElement('label')
    label.className = 'form-group'
    const checkbox = document.createElement('input')
    Object.assign(checkbox, { type: 'checkbox', name: 'killedHuman' })
    label.append(checkbox, localize('DrainHuman'))
    content.append(label)
  }
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
              killedHuman: button.form.elements.killedHuman?.checked ?? false
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
