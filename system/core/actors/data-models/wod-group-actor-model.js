export class WoDGroupActorModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields

    return {
      subtype: new fields.StringField({ initial: 'none', nullable: false }),
      coterieType: new fields.StringField({ initial: '', nullable: false }),
      customCoterieType: new fields.StringField({ initial: '', nullable: false }),
      members: new fields.ArrayField(new fields.StringField({ nullable: false })),

      relationships: new fields.ArrayField(
        new fields.SchemaField({
          id: new fields.StringField({ nullable: false }),
          name: new fields.StringField({ initial: '', nullable: false }),
          memberUuids: new fields.SetField(new fields.StringField({ nullable: false })),
          description: new fields.HTMLField({ initial: '', nullable: false })
        })
      ),

      goals: new fields.HTMLField({ initial: '', nullable: false }),

      domain: new fields.HTMLField({ initial: '', nullable: false }),

      settings: new fields.SchemaField({
        limited: new fields.SchemaField({
          goals: new fields.BooleanField({ initial: false, nullable: false }),
          domain: new fields.BooleanField({ initial: false, nullable: false }),
          members: new fields.BooleanField({ initial: true, nullable: false }),
          relationships: new fields.BooleanField({ initial: false, nullable: false }),
          pooledResources: new fields.BooleanField({ initial: false, nullable: false })
        })
      })
    }
  }
}
