import { BaseDefinitionClass } from './base-definition-class.js'

export class GroupTypes extends BaseDefinitionClass {
  static onReady() {
    GroupTypes.initializeLabels()
  }

  static none = {
    label: 'WOD6E.None'
  }

  static coterie = {
    label: 'WOD6E.VAMPIRE.Coterie'
  }
}

Hooks.once('ready', GroupTypes.onReady)
