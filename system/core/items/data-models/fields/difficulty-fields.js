const fields = foundry.data.fields

// Main export, a TypedObjectField with the Skill Field's data model
export function difficultyFields() {
  return new fields.SchemaField({
    type: new fields.StringField({
      initial: 'variable'
    }),
    fixed: new fields.NumberField({
      initial: null,
      min: 0,
      integer: true,
      nullable: true
    }),
    attribute: new fields.StringField({
      initial: ''
    }),
    useNpcLevel: new fields.BooleanField({
      initial: false
    }),
    description: new fields.HTMLField({
      initial: ''
    })
  })
}
