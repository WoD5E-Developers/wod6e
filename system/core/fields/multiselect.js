export async function _onToggleMultiSelect(event, target) {
  event.preventDefault()

  const multiSelect = target.closest('[data-multi-select]')
  const dropdown = multiSelect?.querySelector('.multi-select-dropdown')

  if (!multiSelect || !dropdown) return

  const hiddenStatus = dropdown.hidden

  dropdown.hidden = !hiddenStatus
}

export async function _onToggleMultiSelectOption(event, target) {
  const multiSelect = target.closest('[data-multi-select]')
  const fieldPath = multiSelect?.dataset.fieldPath

  if (!multiSelect || !fieldPath) return

  const document = this.document ?? this.item ?? this.actor
  if (!document?.isOwner) return

  const currentValues = new Set(foundry.utils.getProperty(document, fieldPath) ?? [])

  // Either push or remove the current target from the currentValues to update the list
  if (target.checked) {
    currentValues.add(target.value)
  } else {
    currentValues.delete(target.value)
  }

  // Save the value to the fieldPath provided
  await document.update({
    [fieldPath]: Array.from(currentValues)
  })
}

export function _onDocumentPointerDown(event) {
  if (event.target.closest('.multi-select')) return

  document.querySelectorAll('.multi-select-dropdown').forEach((dropdown) => {
    dropdown.hidden = true

    dropdown
      .closest('.multi-select')
      ?.querySelector('.multi-select-trigger')
      ?.setAttribute('aria-expanded', 'false')
  })
}
