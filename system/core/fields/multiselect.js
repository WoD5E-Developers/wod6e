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

  // Handle multiselects nested inside system.tests
  const testMatch = fieldPath.match(/^system\.tests\.(\d+)\.(attributes|skills|disciplines)$/)

  if (testMatch) {
    const index = Number(testMatch[1])
    const field = testMatch[2]

    const tests = document.system.tests.map((test) => ({
      description: test.description ?? '',
      attributes: Array.from(test.attributes ?? []),
      skills: Array.from(test.skills ?? []),
      disciplines: Array.from(test.disciplines ?? [])
    }))

    const currentValues = new Set(tests[index][field] ?? [])

    if (target.checked) {
      currentValues.add(target.value)
    } else {
      currentValues.delete(target.value)
    }

    tests[index][field] = Array.from(currentValues)

    await document.update({
      'system.tests': tests
    })

    return
  }

  // All ordinary multiselect fields
  const currentValues = new Set(foundry.utils.getProperty(document, fieldPath) ?? [])

  if (target.checked) {
    currentValues.add(target.value)
  } else {
    currentValues.delete(target.value)
  }

  await document.update({
    [fieldPath]: Array.from(currentValues)
  })
}

export function _onDocumentPointerDown(event) {
  if (event.target.closest('.multi-select')) return

  document.querySelectorAll('.multi-select-dropdown').forEach((dropdown) => {
    dropdown.hidden = true

    dropdown.closest('.multi-select')?.querySelector('.multi-select-trigger')
  })
}
