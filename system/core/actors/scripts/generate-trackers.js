export function generateTrackers({
  name = '',
  damageName = '',
  value,
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
  value = Math.clamp(value, 0, usableMaximum)

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
      filled = reverse ? trackerValue <= value : position <= value
    } else {
      filled = trackerValue === value
    }

    const trackerSpace = {
      position,
      trackerValue,
      filled,
      disabled: isDisabled,
      title: isDisabled ? `Disabled due to ${damageName} damage` : `Set ${name} to ${trackerValue}`,
      disabledState: isDisabled ? 'disabled' : '',
      middle: onlyCurrentValueSelected ? trackerValue === Math.ceil(max / 2) : false
    }

    return trackerSpace
  })

  const trackerGroups = []
  for (let index = 0; index < trackerArray.length; index += groupSize) {
    trackerGroups.push(trackerArray.slice(index, index + groupSize))
  }

  return trackerGroups
}
