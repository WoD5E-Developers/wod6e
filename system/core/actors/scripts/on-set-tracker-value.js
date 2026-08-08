export async function _onSetTrackerValue(event, target) {
  const uuid = target?.dataset?.uuid ?? this.actor.uuid
  const document = fromUuidSync(uuid)

  const path = target.dataset.resourcePath
  const selectedValue = Number(target.dataset.value)
  const tracker = foundry.utils.getProperty(document, path)

  // Some defaults and sanity checking for these values
  const currentValue = tracker?.value || 0
  const maxValue = tracker?.max || 1
  const disabledValue = tracker?.disabled || 0

  if (!Number.isInteger(selectedValue)) return

  // Determine whether to update the value or reduce by one
  // depending on if the user is clicking a filled in dot or
  // not.
  if (selectedValue != currentValue) {
    await document.update({
      [`${path}.value`]: Math.clamp(selectedValue, 0, maxValue - disabledValue)
    })
  } else {
    await document.update({
      [`${path}.value`]: Math.clamp(selectedValue - 1, 0, maxValue - disabledValue)
    })
  }
}
