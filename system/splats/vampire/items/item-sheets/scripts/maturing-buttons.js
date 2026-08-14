export async function _onAddMaturing(event) {
  event.preventDefault()

  const maturing = this.item.system.maturing ?? []

  maturing.push({
    level: 1,
    description: ''
  })

  return this.item.update({
    'system.maturing': maturing
  })
}

export async function _onRemoveMaturing(event, target) {
  event.preventDefault()

  const index = Number(target.dataset.index)

  if (!Number.isInteger(index)) return

  const maturing = this.item.system.maturing ?? []

  maturing.splice(index, 1)

  return this.item.update({
    'system.maturing': maturing
  })
}
