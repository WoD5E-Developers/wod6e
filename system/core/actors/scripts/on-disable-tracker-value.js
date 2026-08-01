export async function _onDisableTrackerValue(event) {
  event.preventDefault()

  const target = event.currentTarget
  const path = target.dataset.resourcePath
  const selectedValue = Number(target.dataset.value)
  const tracker = foundry.utils.getProperty(this.actor, path)

  // There's a value on each tracker 'canBeDisabled' which
  // controls this; I assume willpower damage (and other resource)
  // damage types will be implemented in the future, so this is just
  // sane to do ahead of time
  if (!tracker.canBeDisabled) return

  // Do nothing if the tracker's already completely disabled
  // (The character's already dead, we just don't want negative values)
  if (tracker.disabled >= tracker.max) return

  // Check if the position of the button clicked on is greater than
  // the current max value (accounting for disabled fields)
  // If it is, then the user likely is trying to un-disable the
  // field.
  if (selectedValue > tracker.max - tracker.disabled) {
    await this.actor.update({
      [`${path}.disabled`]: tracker.disabled - 1,
      [`${path}.value`]: Math.clamp(tracker.value, 0, tracker.max - tracker.disabled)
    })
  } else {
    // Otherwise, increase the number of disabled fields by one.
    // Also, here we're accounting for reducing the value
    // if the value would exceed the max - disabled amount.
    await this.actor.update({
      [`${path}.disabled`]: tracker.disabled + 1,
      [`${path}.value`]: Math.clamp(tracker.value, 0, tracker.max - tracker.disabled)
    })
  }
}
