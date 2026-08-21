export async function adjustQuickening(user, amount) {
  const current = Number(user.getFlag('wod6e', 'quickening') ?? 0)
  const value = Math.clamp(current + amount, 0, 5)

  if (value === current) return

  if (value > current) {
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker(),
      content: `
        <div class="wod6e chat-card">
          <h4 class="chat-card-name">${game.i18n.localize('WOD6E.CHAT.QuickeningGained')}</h4>
          <div class="chat-card-description">
            ${game.i18n.format('WOD6E.CHAT.UserHasGainedAmountQuickening', {
              user: user.name,
              amount
            })}
          </div>
        </div>
      `
    })
  } else {
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker(),
      content: `
        <div class="wod6e chat-card">
          <h4 class="chat-card-name">${game.i18n.localize('WOD6E.CHAT.QuickeningSpent')}</h4>
          <div class="chat-card-description">
            ${game.i18n.format('WOD6E.CHAT.UserHasSpentAmountQuickening', {
              user: user.name,
              amount: Math.abs(amount)
            })}
          </div>
        </div>
      `
    })
  }

  await user.setFlag('wod6e', 'quickening', value)
}
