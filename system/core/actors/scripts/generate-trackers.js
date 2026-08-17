export function generateTrackers({
  name = '',
  damageName = '',
  value,
  effective,
  max,
  disabled = 0,
  groupSize = 5,
  reverse = false,
  onlyCurrentValueSelected = false
}) {
  // Maximum can't go below 1
  max = Math.max(1, max)
  // We can't have more disabled than the max value
  disabled = Math.clamp(disabled, 0, max)

  // Sanity check the value after we sanity check the other two
  const usableMaximum = max - disabled
  const effectiveValue = Math.clamp(effective ?? value, 0, usableMaximum)

  // Group size must be a positive integer
  groupSize = Math.max(1, Math.trunc(groupSize))

  // Generating an array like this leads to the first value being
  // undefined (as per MDN)
  // Seems a little silly but this also seemed very convenient
  // for the usecase, so undefined value it is
  const trackerArray = Array.from({ length: max }, (undef, index) => {
    const position = index + 1
    const trackerValue = reverse ? max - index : position
    const isDisabled = position > usableMaximum
    let filled
    if (!onlyCurrentValueSelected) {
      filled = reverse ? trackerValue <= effectiveValue : position <= effectiveValue
    } else {
      filled = trackerValue === effectiveValue
    }

    const modified = filled && value !== effectiveValue

    const trackerSpace = {
      position,
      trackerValue,
      filled,
      disabled: isDisabled,
      title: isDisabled
        ? `Disabled due to ${damageName} damage`
        : `Set ${name} to ${trackerValue}${
            modified
              ? `; ${game.i18n.localize('WOD6E.CONDITIONS.ValueHasBeenModifiedByCondition')}`
              : ''
          }`,
      disabledState: isDisabled ? 'disabled' : '',
      middle: onlyCurrentValueSelected ? trackerValue === Math.ceil(max / 2) : false,
      modified
    }

    return trackerSpace
  })

  const trackerGroups = []

  if (reverse) {
    for (let end = trackerArray.length; end > 0; end -= groupSize) {
      const start = Math.max(0, end - groupSize)
      trackerGroups.unshift(trackerArray.slice(start, end))
    }
  } else {
    for (let start = 0; start < trackerArray.length; start += groupSize) {
      trackerGroups.push(trackerArray.slice(start, start + groupSize))
    }
  }

  return trackerGroups
}
