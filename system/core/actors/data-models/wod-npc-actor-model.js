import { NpcTiers } from '../../config/npc-tiers.js'
import { attributeFields } from './fields/attribute-fields.js'
import { coreActorFields } from './fields/core-actor-fields.js'
import { npcCategories, npcCreatureTypes, npcFields } from './fields/npc-fields.js'
import { skillFields } from './fields/skill-fields.js'
import { disciplineFields } from '../../../splats/vampire/actors/data-models/fields/discipline-fields.js'

export class WoDNpcActorModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...coreActorFields(),
      ...npcFields(),
      attributes: attributeFields(),
      skills: skillFields(),
      disciplines: disciplineFields({ npc: true })
    }
  }

  static migrateData(source, options) {
    const level = foundry.utils.isPlainObject(source.level) ? source.level : null
    const hasDefeated = typeof source.defeated === 'boolean'
    const legacy = source.legacyNpc
    const hasLegacyData = Boolean(level || hasDefeated)

    // Stored Alpha 2 stat blocks can still contain old level and defeated fields.
    // Their legacy snapshot records the original tier, not the currently selected one.
    if (source.tier !== 'elite' && (legacy || !hasLegacyData)) {
      if (options?.partial && source.tier !== undefined && source.minion === undefined) {
        source.minion = false
      }
      return super.migrateData(source, options)
    }

    const tier = source.tier
    const minion = tier === 'minion'
    const elite = tier === 'elite'
    const defeated = hasDefeated ? source.defeated : (legacy?.defeated ?? false)
    const legacyLevel = { ...legacy?.level, ...level }
    const levels = Object.fromEntries(
      npcCategories.map((key) => [key, (elite ? legacyLevel[key] : legacyLevel.value) ?? 1])
    )
    source.legacyNpc = { tier: tier ?? 'standard', level: legacyLevel, defeated }
    source.tier = minion ? 'minion' : 'standard'
    source.minion = false
    source.attributePools = Object.fromEntries(npcCategories.map((key) => [key, 2 * levels[key]]))

    const creatureName = String(source.creatureType ?? '')
      .trim()
      .toLowerCase()
    const legacyKind = creatureName.split(/[\s,(/-]/, 1)[0]
    source.creatureKind ??= npcCreatureTypes.includes(legacyKind)
      ? legacyKind
      : legacyKind === 'duskborn'
        ? 'vampire'
        : 'other'

    if (minion) {
      source.health = { ...source.health, value: defeated ? 0 : 1, disabled: 0 }
    } else {
      // Keep the previous effective maxima until the resource rules are updated.
      const healthMax = levels.physical * (elite ? 5 : 3)
      const willpowerMax = Math.max(levels.social, levels.mental) * (elite ? 5 : 3)
      source.health = { ...source.health, max: healthMax }
      source.willpower = { ...source.willpower, max: willpowerMax }
    }

    delete source.level
    delete source.defeated
    return super.migrateData(source, options)
  }

  get isMinion() {
    return this.tier === 'minion' || (this.tier === 'minor' && this.minion)
  }

  get hasAttributeData() {
    return NpcTiers.getDefinition(this.tier).usesDetailedTraits
  }

  get hasSkillData() {
    return this.hasAttributeData
  }

  get hasDisciplineData() {
    return true
  }
}
