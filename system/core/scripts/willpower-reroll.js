import { WOD6eRoll } from './wod6e-roll.js'
import { pendingTestUpdates } from './test-locks.js'
import { withResourceSpend } from '../actors/scripts/resource-spending.js'

export function getOrdinaryDice(roll) {
  return roll.dice.flatMap((die, dieIndex) => {
    if (die.faces !== 10 || die.options.hunger || die.options.flavor === 'Hunger') return []
    return die.results.flatMap((result, resultIndex) =>
      result.active
        ? [{ id: `${dieIndex}:${resultIndex}`, dieIndex, resultIndex, value: result.result }]
        : []
    )
  })
}

export function canRerollWithWillpower(message) {
  if (!message?.isContentVisible || !message.isOwner || message.rolls?.length !== 1) return false
  const actor = message.speakerActor
  const roll = message.rolls[0]
  return Boolean(
    actor?.isOwner &&
    actor.system.willpower?.value >= 1 &&
    roll instanceof WOD6eRoll &&
    roll.options.resolutionVersion === 2 &&
    !roll.automaticFailure &&
    roll.options.resolutionMode !== 'takeHalf' &&
    !roll.options.willpowerReroll &&
    !roll.options.beastsBargain?.accepted &&
    !message.getFlag('wod6e', 'retryUsed') &&
    getOrdinaryDice(roll).length
  )
}

export async function rerollWithWillpower(message, selectedIds, expectedRoll) {
  const unavailable = () => new Error(game.i18n.localize('WOD6E.ROLL.WillpowerRerollUnavailable'))
  if (!canRerollWithWillpower(message) || pendingTestUpdates.has(message.id)) throw unavailable()
  const original = message.rolls[0]
  const snapshot = JSON.stringify(original)
  if (expectedRoll && expectedRoll !== snapshot) throw unavailable()
  const ordinary = getOrdinaryDice(original)
  if (
    !Array.isArray(selectedIds) ||
    selectedIds.length < 1 ||
    selectedIds.length > 3 ||
    new Set(selectedIds).size !== selectedIds.length
  )
    throw unavailable()
  const selected = selectedIds.map((id) => ordinary.find((die) => die.id === id))
  if (selected.some((die) => !die)) throw unavailable()

  pendingTestUpdates.add(message.id)
  try {
    const rerolled = await withResourceSpend(
      message.speakerActor,
      { resource: 'willpower', amount: 1 },
      async () => {
        const replacements = await new foundry.dice.Roll(`${selected.length}d10`).evaluate({
          allowInteractive: !message.blind
        })
        // Work on a copy: neither failed evaluation nor failed persistence changes the old dice.
        const updated = WOD6eRoll.fromData(JSON.parse(snapshot))
        selected.forEach(({ dieIndex, resultIndex }, index) => {
          const die = updated.dice[dieIndex]
          Object.assign(die.results[resultIndex], { active: false, rerolled: true })
          die.results.push({ result: replacements.dice[0].results[index].result, active: true })
        })
        updated.options.willpowerReroll = { spent: 1, dice: selectedIds, userId: game.user.id }
        updated._scoreDice()
        if (
          JSON.stringify(message.rolls[0]) !== snapshot ||
          message.getFlag('wod6e', 'retryUsed')
        ) {
          throw unavailable()
        }
        await message.update({ rolls: [JSON.stringify(updated)] })
        return updated
      }
    )

    try {
      const actor = message.speakerActor
      const content = document.createElement('p')
      content.textContent = game.i18n.format(
        selected.length === 1
          ? 'WOD6E.ROLL.WillpowerRerollMessageSingular'
          : 'WOD6E.ROLL.WillpowerRerollMessage',
        { character: actor.name, number: selected.length }
      )
      const whisper = [...message.whisper]
      if (whisper.length && !message.blind && message.author?.id) whisper.push(message.author.id)
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor }),
        content: content.outerHTML,
        whisper: [...new Set(whisper)],
        blind: message.blind
      })
    } catch (error) {
      // The reroll is already saved; a chat failure must not refund its Willpower cost.
      ui.notifications.warn(error.message)
    }
    return rerolled
  } finally {
    pendingTestUpdates.delete(message.id)
  }
}

export async function promptWillpowerReroll(message) {
  if (!canRerollWithWillpower(message)) return
  const snapshot = JSON.stringify(message.rolls[0])
  const localize = (key) => game.i18n.localize(`WOD6E.ROLL.${key}`)
  const content = document.createElement('div')
  const hint = document.createElement('p')
  hint.textContent = localize('WillpowerRerollHint')
  const choices = document.createElement('div')
  choices.className = 'willpower-dice'
  getOrdinaryDice(message.rolls[0]).forEach((die, index) => {
    const choice = document.createElement('button')
    Object.assign(choice, { type: 'button', name: 'dice', value: die.id })
    choice.className = 'willpower-die-choice'
    choice.setAttribute(
      'title',
      game.i18n.format('WOD6E.ROLL.RerollDie', { number: index + 1, value: die.value })
    )
    const face = document.createElement('span')
    face.className = 'willpower-die'
    const icon = document.createElement('i')
    icon.className = 'fa-solid fa-dice-d10'
    const value = document.createElement('span')
    value.className = 'willpower-die-value'
    value.textContent = String(die.value)
    face.append(icon, value)
    choice.append(face)
    choices.append(choice)
  })
  content.append(hint, choices)
  return foundry.applications.api.DialogV2.wait({
    window: { title: localize('WillpowerReroll') },
    classes: ['wod6e', 'willpower-reroll-dialog'],
    position: { width: 420 },
    content,
    form: { closeOnSubmit: false },
    render: (_event, dialog) => {
      const form = dialog.element.querySelector('form')
      const dice = form.querySelectorAll('[name="dice"]')
      const update = () => {
        const count = form.querySelectorAll('[name="dice"].die-selected').length
        form.querySelector('[data-action="reroll"]').disabled = count < 1 || count > 3
        for (const choice of dice) {
          choice.disabled = !choice.classList.contains('die-selected') && count >= 3
        }
      }
      for (const choice of dice) {
        choice.addEventListener('click', (event) => {
          event.preventDefault()
          event.stopPropagation()
          if (choice.disabled) return
          choice.classList.toggle('die-selected')
          update()
        })
      }
      update()
    },
    buttons: [
      {
        action: 'reroll',
        default: true,
        disabled: true,
        label: localize('SpendWillpower'),
        callback: async (_event, button, dialog) => {
          const ids = [...button.form.querySelectorAll('[name="dice"].die-selected')].map(
            (choice) => choice.value
          )
          try {
            await rerollWithWillpower(message, ids, snapshot)
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
