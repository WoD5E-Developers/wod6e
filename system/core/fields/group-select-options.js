import { getGroupLabel } from './get-group-label.js'

export const groupSelectOptions = (options) => {
  const groups = {}

  for (const option of options) {
    const type = option.type ?? 'other'

    if (!groups[type]) {
      groups[type] = {
        key: type,
        label: getGroupLabel(type),
        options: []
      }
    }

    groups[type].options.push(option)
  }

  return Object.values(groups)
}
