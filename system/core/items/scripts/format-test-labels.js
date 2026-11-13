export const formatOptionLabel = (labels) => {
  if (!labels.length) return game.i18n.localize('WOD6E.NoneSelected')
  if (labels.length === 1) return labels[0]
  if (labels.length === 2) return `${labels[0]} or ${labels[1]}`

  return `${labels.slice(0, -1).join(', ')} or ${labels.at(-1)}`
}

export const formatTest = (...options) => {
  const selected = options
    .map((option) => (Array.isArray(option) ? { labels: option, mode: 'any' } : option))
    .filter((option) => option?.labels?.length)
    .map(({ labels, mode }) => {
      if (mode === 'all') return labels.join(' + ')
      const text = formatOptionLabel(labels)
      return labels.length > 1 ? `(${text})` : text
    })

  if (!selected.length) {
    return game.i18n.localize('WOD6E.NoneSelected')
  }

  return selected.join(' + ')
}
