import { RollDialog } from '../dialogs/roll-dialog.js'
import { WOD6eRoll } from './wod6e-roll.js'

const pendingBargains = new Set()

// Follow-ups are Storyteller decisions; the original dice and margin remain recorded.
export function getFollowupRoll(message) {
  if (!game.user.isGM || !message?.isContentVisible || message.rolls?.length !== 1) return null
  const roll = message.rolls[0]
  return roll instanceof WOD6eRoll && roll.options.failureRulesVersion === 2 ? roll : null
}

export function getAvailableFollowups(message) {
  const roll = getFollowupRoll(message)
  const available = roll && !message.getFlag('wod6e', 'retryUsed')
  const bargainDenied = Boolean(roll && message.getFlag('wod6e', 'beastsBargainDenied'))
  return {
    bargain: Boolean(available && !bargainDenied && roll.canBeastsBargain),
    bargainDenied,
    retry: Boolean(available && roll.canRetry && message.speakerActor)
  }
}

// Message state and viewer permissions are available after the roll template renders.
export function renderTestFollowupButtons(message, html) {
  const content = html.querySelector('.message-content')
  if (!content) return
  content.querySelector(':scope > .wod6e-test-actions')?.remove()
  const available = getAvailableFollowups(message)
  const footer = document.createElement('div')
  footer.className = 'wod6e-test-actions'
  for (const [action, label, description, handler] of [
    ['bargain', 'BeastsBargain', 'BeastsBargainHint', promptBeastsBargain],
    ['retry', 'Retry', 'RetryRules', openRetry]
  ]) {
    const denied = action === 'bargain' && available.bargainDenied
    if (!available[action] && !denied) continue
    const button = document.createElement('button')
    button.type = 'button'
    button.dataset.action = action
    button.textContent = game.i18n.localize(`WOD6E.ROLL.${denied ? 'BargainDenied' : label}`)
    button.title = game.i18n.localize(`WOD6E.ROLL.${denied ? 'BargainDenied' : description}`)
    button.disabled = denied
    footer.append(button)
    if (denied) continue
    button.addEventListener('click', async (event) => {
      event.preventDefault()
      event.stopPropagation()
      button.disabled = true
      try {
        await handler(message)
      } catch (error) {
        ui.notifications.warn(error.message)
      } finally {
        renderTestFollowupButtons(message, html)
      }
    })
  }
  if (footer.childElementCount) content.append(footer)
}

export async function denyBeastsBargain(message) {
  if (!getAvailableFollowups(message).bargain || pendingBargains.has(message.id)) {
    throw new Error(game.i18n.localize('WOD6E.ROLL.BargainUnavailable'))
  }
  pendingBargains.add(message.id)
  try {
    await message.setFlag('wod6e', 'beastsBargainDenied', true)
  } finally {
    pendingBargains.delete(message.id)
  }
}

export async function applyBeastsBargain(message, { cost, acceptedByPlayer }) {
  const roll = getFollowupRoll(message)
  if (
    !roll?.canBeastsBargain ||
    message.getFlag('wod6e', 'retryUsed') ||
    message.getFlag('wod6e', 'beastsBargainDenied') ||
    !acceptedByPlayer ||
    !cost?.trim()
  ) {
    throw new Error(game.i18n.localize('WOD6E.ROLL.BargainUnavailable'))
  }

  // Foundry's toJSON returns an object; copy it without mutating the live roll options.
  const data = JSON.parse(JSON.stringify(roll))
  data.options.beastsBargain = {
    accepted: true,
    storytellerId: game.user.id,
    cost: cost.trim(),
    originalMarginOfFailure: roll.marginOfFailure
  }
  if (pendingBargains.has(message.id)) {
    throw new Error(game.i18n.localize('WOD6E.ROLL.BargainUnavailable'))
  }
  pendingBargains.add(message.id)
  try {
    await message.update({ rolls: [JSON.stringify(data)] })
  } finally {
    pendingBargains.delete(message.id)
  }
}

export async function promptBeastsBargain(message) {
  if (!getAvailableFollowups(message).bargain) return
  const content = document.createElement('div')
  const localize = (key) => game.i18n.localize(`WOD6E.ROLL.${key}`)
  const instruction = document.createElement('p')
  instruction.className = 'bargain-instruction'
  instruction.textContent = localize('BeastsBargainHint')
  content.append(instruction)

  const addField = (name, label, type) => {
    const wrapper = document.createElement('label')
    const checkbox = type === 'checkbox'
    wrapper.className = checkbox ? 'bargain-confirmation' : 'bargain-field'
    const text = document.createElement('span')
    text.textContent = localize(label)
    const input = document.createElement(type === 'textarea' ? 'textarea' : 'input')
    if (type !== 'textarea') input.type = type
    else input.rows = 5
    input.name = name
    input.required = true
    wrapper.append(...(checkbox ? [input, text] : [text, input]))
    content.append(wrapper)
  }
  addField('cost', 'BargainCost', 'textarea')
  addField('acceptedByPlayer', 'BargainPlayerAccepted', 'checkbox')

  return foundry.applications.api.DialogV2.wait({
    window: { title: localize('BeastsBargain') },
    classes: ['wod6e', 'beasts-bargain-dialog'],
    position: { width: 640 },
    content,
    form: { closeOnSubmit: false },
    render: (_event, dialog) => {
      const form = dialog.element.querySelector('form')
      const updateButton = () => {
        form.querySelector('[data-action="accept"]').disabled =
          !form.checkValidity() || !form.elements.cost.value.trim()
      }
      form.addEventListener('input', updateButton)
      form.addEventListener('change', updateButton)
      updateButton()
    },
    buttons: [
      {
        action: 'cancel',
        type: 'button',
        label: game.i18n.localize('WOD6E.Cancel'),
        callback: (_event, _button, dialog) => dialog.close()
      },
      {
        action: 'deny',
        type: 'button',
        label: localize('BargainDenied'),
        callback: async (_event, _button, dialog) => {
          try {
            await denyBeastsBargain(message)
            await dialog.close()
            return true
          } catch (error) {
            ui.notifications.warn(error.message)
            return false
          }
        }
      },
      {
        action: 'accept',
        label: localize('AcceptBargain'),
        default: true,
        disabled: true,
        callback: async (_event, button, dialog) => {
          const form = button.form
          if (!form.reportValidity()) return false
          try {
            await applyBeastsBargain(message, {
              cost: form.elements.cost.value,
              acceptedByPlayer: form.elements.acceptedByPlayer.checked
            })
            await dialog.close()
            return true
          } catch (error) {
            ui.notifications.warn(error.message)
            return false
          }
        }
      }
    ],
    rejectClose: false
  })
}

export async function openRetry(message) {
  if (!getAvailableFollowups(message).retry) return
  const roll = getFollowupRoll(message)
  return RollDialog.open({
    actor: message.speakerActor,
    test: {
      ...roll.options,
      retryOf: message.id,
      difficulty: roll.options.difficulty + 1,
      resolutionMode: 'roll'
    }
  })
}
