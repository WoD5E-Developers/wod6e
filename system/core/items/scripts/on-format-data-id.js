export const _onFormatDataId = async function (event) {
  event.preventDefault()

  // Top-level variables
  const item = this.item

  const dataItemId = `${item.type}-${formatDataItemId(item.name)}`

  item.setFlag('wod6e', 'dataItemId', dataItemId)
}

export const formatDataItemId = function (string) {
  return string
    .toLowerCase() // Convert to lowercase
    .trim() // Trim out any extra spaces
    .replace(/\s+/g, '-') // Replace one or more spaces with a single dash
}
