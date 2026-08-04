export class ItemUX {
  // Save the open/closed state of all multi-select dropdowns
  static _saveDropdownStates(item) {
    item._dropdownStates.clear()

    $(item.element)
      .find('[data-multi-select]')
      .each((index, dropdown) => {
        const dropdownElement = $(dropdown)
        const menuElement = dropdownElement.find('.multi-select-dropdown')
        const key = dropdownElement.attr('data-field-path') || index
        const isOpen = !menuElement.prop('hidden')

        if (isOpen) {
          item._dropdownStates.add(key)
        }
      })
  }

  // Restore previously open multi-select dropdowns after a rerender
  static _restoreDropdownStates(item) {
    $(item.element)
      .find('[data-multi-select]')
      .each((index, dropdown) => {
        const dropdownElement = $(dropdown)
        const menuElement = dropdownElement.find('.multi-select-dropdown')
        const triggerElement = dropdownElement.find('.multi-select-trigger')
        const key = dropdownElement.attr('data-field-path') || index
        const isOpen = item._dropdownStates.has(key)

        menuElement.prop('hidden', !isOpen)
        triggerElement.attr('aria-expanded', String(isOpen))
      })
  }
}
