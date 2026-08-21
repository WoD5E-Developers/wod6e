import { getGroupLabel } from './get-group-label.js'

export async function _onToggleMultiSelect(event, target) {
  event.preventDefault()

  const multiSelect = target.closest('[data-multi-select]')
  const dropdown = multiSelect?.querySelector('.multi-select-dropdown')

  if (!multiSelect || !dropdown) return

  dropdown.togglePopover()

  const rect = target.getBoundingClientRect()

  dropdown.style.left = `${rect.left}px`
  dropdown.style.top = `${rect.bottom}px`
  dropdown.style.width = `${rect.width}px`
}

export async function _onToggleMultiSelectOption(event, target) {
  const multiSelect = target.closest('[data-multi-select]')
  const fieldPath = multiSelect?.dataset.fieldPath

  if (!multiSelect || !fieldPath) return

  const document = this.document ?? this.item ?? this.actor
  if (!document?.isOwner) return

  const currentValues = new Set(foundry.utils.getProperty(document, fieldPath) ?? [])

  if (target.checked) {
    currentValues.add(target.value)
  } else {
    currentValues.delete(target.value)
  }

  await _onUpdateField(document, fieldPath, Array.from(currentValues))
}

export async function _onUpdateField(document, fieldPath, value) {
  const parts = fieldPath.split('.')

  // Find the first path segment that's a number
  const arrayIndexPosition = parts.findIndex((part) => /^\d+$/.test(part))

  // No array index in the path - then just update the document normally
  if (arrayIndexPosition === -1) {
    await document.update({
      [fieldPath]: value
    })

    return true
  }

  // If we DID find an array index...
  const arrayIndex = Number(parts[arrayIndexPosition])

  // Everything before the numeric index is the ArrayField path
  const arrayPath = parts.slice(0, arrayIndexPosition).join('.')

  // Everything after it is the field inside the array entry
  const nestedFieldPath = parts.slice(arrayIndexPosition + 1).join('.')

  // Work with raw serialized data
  const documentData = document.toObject()

  const array = foundry.utils.getProperty(documentData, arrayPath) ?? []

  const entry = array[arrayIndex]
  if (!entry) return false

  foundry.utils.setProperty(entry, nestedFieldPath, value)

  await document.update({
    [arrayPath]: array
  })
}

export function _onDocumentPointerDown(event) {
  if (event.target.closest('.multi-select')) return

  document.querySelectorAll('.multi-select-dropdown').forEach((dropdown) => {
    dropdown.hidePopover()
  })
}

export const prepareMultiSelect = (selectedValues, options) => {
  const selected = new Set(selectedValues ?? [])

  const preparedOptions = options.map((option) => ({
    ...option,
    selected: selected.has(option.key)
  }))

  const selectedLabels = preparedOptions
    .filter((option) => option.selected)
    .map((option) => option.label)

  const groups = Object.values(
    preparedOptions.reduce((groups, option) => {
      const type = option.type ?? 'other'

      if (!groups[type]) {
        groups[type] = {
          key: type,
          label: getGroupLabel(type),
          options: []
        }
      }

      groups[type].options.push(option)

      return groups
    }, {})
  )

  return {
    options: preparedOptions,
    groups,

    selectedText: selectedLabels.length
      ? selectedLabels.join(', ')
      : game.i18n.localize('WOD6E.NoneSelected'),

    labels: selectedLabels
  }
}
