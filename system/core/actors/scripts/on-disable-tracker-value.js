export async function _onDisableTrackerValue(event) {
  event.preventDefault()

  const target = event.currentTarget
  const path = target.dataset.resourcePath
  const selectedValue = Number(target.dataset.value)
  const tracker = foundry.utils.getProperty(this.actor, path)

  // Some defaults and sanity checking for these values
  const currentValue = tracker?.value || 0
  const maxValue = tracker?.max || 1
  const disabledValue = tracker?.disabled || 0

  // There's a value on each tracker 'canBeDisabled' which
  // controls this; I assume willpower damage (and other resource)
  // damage types will be implemented in the future, so this is just
  // sane to do ahead of time
  if (!tracker.canBeDisabled) return

  // Do nothing if the tracker's already completely disabled
  // (The character's already dead, we just don't want negative values)
  if (disabledValue >= maxValue) return

  // Check if the position of the button clicked on is greater than
  // the current max value (accounting for disabled fields)
  // If it is, then the user likely is trying to un-disable the
  // field.
  if (selectedValue > maxValue - disabledValue) {
    await this.actor.update({
      [`${path}.disabled`]: disabledValue - 1,
      [`${path}.value`]: Math.clamp(currentValue, 0, maxValue - disabledValue)
    })
  } else {
    // Otherwise, increase the number of disabled fields by one.
    // Also, here we're accounting for reducing the value
    // if the value would exceed the max - disabled amount.
    await this.actor.update({
      [`${path}.disabled`]: disabledValue + 1,
      [`${path}.value`]: Math.clamp(currentValue, 0, maxValue - disabledValue)
    })
  }
}
