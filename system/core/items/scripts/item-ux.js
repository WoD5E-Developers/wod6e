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
        const isOpen = menuElement[0].matches(':popover-open')

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
        const key = dropdownElement.attr('data-field-path') || index

        if (!item._dropdownStates.has(key)) return

        const rect = dropdown.getBoundingClientRect()
        const menu = dropdownElement.find('.multi-select-dropdown')[0]

        if (!menu) return

        menu.style.left = `${rect.left}px`
        menu.style.top = `${rect.bottom}px`
        menu.style.width = `${rect.width}px`

        menu.showPopover()
      })
  }
}
