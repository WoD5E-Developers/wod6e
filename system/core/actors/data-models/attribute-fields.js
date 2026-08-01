const fields = foundry.data.fields

// Main export, a TypedObjectField with the Attribute Field's data model
export function attributeFields() {
  return new fields.TypedObjectField(attributeValueField(), {
    initial: createInitialAttributes()
  })
}

function attributeValueField() {
  return new fields.SchemaField({
    max: new fields.NumberField({ initial: 5, min: 1, integer: true, nullable: false }),
    value: new fields.NumberField({ initial: 1, min: 0, integer: true, nullable: false })
  })
}

// Register all initial attribute fields and values of them
export function createInitialAttributes() {
  const attributes = {}

  for (const key of Object.keys(WOD6E.Attributes.getList({}))) {
    attributes[key] = createInitialAttributeValue()
  }

  return attributes
}

export function createInitialAttributeValue() {
  return {
    value: 1,
    max: 5
  }
}
