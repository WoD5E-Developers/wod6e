import { BaseDefinitionClass } from '../../../core/config/base-definition-class.js'

export class CoterieTypes extends BaseDefinitionClass {
  static onReady() {
    CoterieTypes.initializeLabels()
  }

  static avengers = {
    label: 'WOD6E.VAMPIRE.Avengers'
  }

  static bloodHunters = {
    label: 'WOD6E.VAMPIRE.BloodHunters'
  }

  static dominantRegents = {
    label: 'WOD6E.VAMPIRE.DominantRegents'
  }

  static envoys = {
    label: 'WOD6E.VAMPIRE.Envoys'
  }

  static nightWatchers = {
    label: 'WOD6E.VAMPIRE.NightWatchers'
  }

  static religiousAcolytes = {
    label: 'WOD6E.VAMPIRE.ReligiousAcolytes'
  }

  static custom = {
    label: 'WOD6E.VAMPIRE.Custom'
  }
}

Hooks.once('ready', CoterieTypes.onReady)
