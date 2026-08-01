export async function _onSetTrackerValue(event, target) {
  const path = target.dataset.resourcePath
  const selectedValue = Number(target.dataset.value)
  const tracker = foundry.utils.getProperty(this.actor, path)
  const currentValue = tracker.value

  if (!Number.isInteger(selectedValue)) return

  // Determine whether to update the value or reduce by one
  // depending on if the user is clicking a filled in dot or
  // not.
  if (selectedValue != currentValue) {
    await this.actor.update({
      [`${path}.value`]: Math.clamp(selectedValue, 0, tracker.max - tracker.disabled)
    })
  } else {
    await this.actor.update({
      [`${path}.value`]: Math.clamp(selectedValue - 1, 0, tracker.max - tracker.disabled)
    })
  }
}
