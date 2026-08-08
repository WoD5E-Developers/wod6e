const fields = foundry.data.fields

// Main export, a TypedObjectField with the Skill Field's data model
export function testFields() {
  return new fields.SchemaField({
    description: new fields.StringField({
      initial: ''
    }),
    attributes: new fields.SetField(
      new fields.StringField({
        blank: false,
        nullable: false
      }),
      {
        initial: []
      }
    ),

    skills: new fields.SetField(
      new fields.StringField({
        blank: false,
        nullable: false
      }),
      {
        initial: []
      }
    ),

    disciplines: new fields.SetField(
      new fields.StringField({
        blank: false,
        nullable: false
      }),
      {
        initial: []
      }
    )
  })
}
