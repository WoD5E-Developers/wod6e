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

  const values = Array.from(
    multiSelect.querySelectorAll('input[type="checkbox"]:checked'),
    (input) => input.value
  )

  await document.update({
    [fieldPath]: values
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
