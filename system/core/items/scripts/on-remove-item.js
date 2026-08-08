export const _onRemoveItem = async function (event) {
  event.preventDefault()

  const item = this.item

  // Define the content of the Dialog
  const content = `<p>
    ${game.i18n.format('WOD6E.ITEMS.ConfirmDeleteDescription', {
      string: item.name
    })}
  </p>`

  // Prompt a dialog for the user to confirm they want to delete the item
  const confirmDelete = await foundry.applications.api.DialogV2.wait({
    window: {
      title: game.i18n.localize('WOD6E.ITEMS.ConfirmDelete')
    },
    classes: ['wod6e', 'dialog'],
    content,
    modal: true,
    buttons: [
      {
        label: game.i18n.localize('WOD6E.Confirm'),
        action: true
      },
      {
        label: game.i18n.localize('WOD6E.Cancel'),
        action: false
      }
    ]
  })

  if (confirmDelete) {
    item.delete()
  }
}
