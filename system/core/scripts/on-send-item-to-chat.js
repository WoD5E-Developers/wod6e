export const _onSendItemToChat = async function (event, target) {
  event?.preventDefault()

  const uuid = target?.dataset?.uuid
  if (!uuid) return

  const item = fromUuidSync(uuid)

  if (!item) return console.warn(`No item found with UUID "${uuid}"`)

  const description = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
    item.system.description ?? '',
    {
      async: true,
      secrets: item.isOwner,
      relativeTo: item
    }
  )

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({
      actor: item.actor
    }),
    content: `
      <div class="wod6e chat-card item-card">
        <h4 class="item-name">${item.name}</h4>
        <div class="item-description">
          ${description}
        </div>
      </div>
    `
  })
}
