export class WoDItemModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields

    const schema = {}

    // Description
    schema.description = new fields.HTMLField({ initial: '' })

    // Data Item ID
    schema.dataItemId = new fields.StringField({ initial: '' })

    // Source information
    schema.source = new fields.SchemaField({
      book: new fields.StringField({ initial: '' }),
      page: new fields.StringField({ initial: '' })
    })

    return schema
  }
}
