import { canPayCost, getItemCost, withResourceSpend } from '../actors/scripts/resource-spending.js'

export function renderItemCostButton(message, html) {
  const button = html.querySelector('[data-action="payItemCost"]')
  if (!button) return
  const item = fromUuidSync(button.dataset.itemUuid)
  const cost = getItemCost(item)
  const paid = message.getFlag('wod6e', 'activationCostPaid')
  button.hidden = !message.isOwner || !item?.actor?.isOwner || !cost
  button.disabled = Boolean(paid) || !canPayCost(item?.actor, cost)
  button.textContent = game.i18n.localize(`WOD6E.RESOURCES.${paid ? 'CostPaid' : 'PayCost'}`)
}

export async function payItemCost(event, target) {
  event.preventDefault()
  const message = game.messages.get(target.closest('[data-message-id]')?.dataset.messageId)
  const item = fromUuidSync(target.dataset.itemUuid)
  const cost = getItemCost(item)
  if (
    !message?.isOwner ||
    !item?.actor?.isOwner ||
    !cost ||
    message.getFlag('wod6e', 'activationCostPaid')
  )
    return
  target.disabled = true
  try {
    await withResourceSpend(item.actor, cost, () =>
      message.setFlag('wod6e', 'activationCostPaid', true)
    )

    await postItemCostMessage({ actor: item.actor, item, cost, message })
  } catch (error) {
    ui.notifications.warn(error.message)
  } finally {
    const html = target.closest('[data-message-id]')
    if (html) renderItemCostButton(message, html)
  }
}

// Call after payment is saved so a chat failure cannot refund an already-paid cost.
export async function postItemCostMessage({ actor, item, cost, message }) {
  try {
    const content = document.createElement('p')
    content.textContent = game.i18n.format('WOD6E.RESOURCES.ItemCostMessage', {
      character: actor.name,
      number: cost.amount,
      resource: WOD6E.configs.CostTypes.getList({})[cost.resource].displayName,
      item: item.name
    })
    const whisper = [...message.whisper]
    if (whisper.length && !message.blind && message.author?.id) whisper.push(message.author.id)
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: content.outerHTML,
      whisper: [...new Set(whisper)],
      blind: message.blind
    })
  } catch (error) {
    ui.notifications.warn(error.message)
  }
}
