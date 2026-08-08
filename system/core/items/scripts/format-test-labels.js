export const formatOptionLabel = (labels) => {
  if (!labels.length) return game.i18n.localize('WOD6E.NoneSelected')
  if (labels.length === 1) return labels[0]
  if (labels.length === 2) return `${labels[0]} or ${labels[1]}`

  return `${labels.slice(0, -1).join(', ')} or ${labels.at(-1)}`
}

export const formatTest = (...options) => {
  const selected = options
    .filter((option) => option?.length)
    .map((option) => formatOptionLabel(option))

  if (!selected.length) {
    return game.i18n.localize('WOD6E.NoneSelected')
  }

  return selected.join(' + ')
}
