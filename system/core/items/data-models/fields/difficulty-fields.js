const fields = foundry.data.fields

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
    targetsTrait: new fields.StringField({
      initial: ''
    }),
    singleAttribute: new fields.StringField({
      initial: ''
    }),
    multipleAttributes: new fields.SetField(
      new fields.StringField({
        blank: false,
        nullable: false
      }),
      {
        initial: []
      }
    ),
    description: new fields.HTMLField({
      initial: ''
    })
  })
}
