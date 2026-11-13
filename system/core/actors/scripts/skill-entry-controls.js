export const readSpecialization = (form, key) => form.elements.namedItem(`specialization.${key}`)
export const splitSpecializations = (value) =>
  value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)

export function readSkillEntries(form, key) {
  const input = readSpecialization(form, key)
  const entries = input.closest('.npc-specialization-row').querySelectorAll('[data-specialization]')
  return [
    ...Array.from(entries, (entry) => entry.textContent),
    ...splitSpecializations(input.value)
  ]
}

export function attachSkillEntryControls(editor, removeEntryLabel) {
  const addSpecializations = (input) => {
    const entries = splitSpecializations(input.value)
    const list = input.closest('.npc-specialization-row').querySelector('ul')
    for (const entry of entries) {
      const item = document.createElement('li')
      const name = document.createElement('span')
      name.dataset.specialization = ''
      name.title = entry
      name.textContent = entry
      const remove = document.createElement('button')
      remove.type = 'button'
      remove.dataset.removeSpecialization = ''
      remove.title = game.i18n.localize(removeEntryLabel)
      remove.textContent = '×'
      item.append(name, remove)
      list.append(item)
    }
    input.value = ''
    input.focus()
  }

  editor.addEventListener('click', (event) => {
    const button = event.target.closest('button')
    if (!button) return
    const row = button.closest('.npc-specialization-row')
    if (!row) return
    const input = row.querySelector('input')
    if (button.hasAttribute('data-add-specialization')) addSpecializations(input)
    if (button.hasAttribute('data-remove-specialization')) {
      button.closest('li').remove()
      input.focus()
    }
  })
  editor.addEventListener('keydown', (event) => {
    if (
      event.key !== 'Enter' ||
      event.isComposing ||
      !event.target.matches('.npc-specialization-row input')
    )
      return
    event.preventDefault()
    addSpecializations(event.target)
  })
}
