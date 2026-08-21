import { resolveModifierValue } from './resolve-modifier-value.js'

export class ActorEffects {
  /**
   * Initialize the Actor's prepared effect collections
   */
  static _initializePreparedEffects(actor) {
    actor.preparedEffects = {
      effects: [],
      restrictions: []
    }
  }

  /**
   * Gather effects and restrictions from embedded condition items
   */
  static _prepareConditionEffects(actor) {
    const conditions = actor.items.filter((item) => item.type === 'condition')

    for (const condition of conditions) {
      const effects = condition.system.effects ?? []
      const restrictions = condition.system.restrictions ?? []

      for (const [effectIndex, effect] of effects.entries()) {
        actor.preparedEffects.effects.push({
          ...effect,
          effectId: `${condition.id}:${effectIndex}`,
          sourceActorUuid: condition.system.condition?.sourceUuid,
          sourceId: condition.id,
          sourceUuid: condition.uuid,
          sourceName: condition.name,
          sourceType: condition.type
        })
      }

      for (const restriction of restrictions) {
        actor.preparedEffects.restrictions.push({
          ...restriction,
          sourceId: condition.id,
          sourceUuid: condition.uuid,
          sourceName: condition.name,
          sourceType: condition.type
        })
      }
    }
  }

  /**
   * Apply effects which modify the Actor's prepared data.
   *
   * Effects such as "dice" are intentionally not handled here,
   * because they apply to a roll/test context rather than directly
   * modifying Actor data.
   */
  static _applyActorEffects(actor) {
    const effects = actor.preparedEffects?.effects ?? []

    for (const effect of effects) {
      switch (effect.type) {
        case 'actorTrait':
          this._applyActorTraitEffect(actor, effect)
          break

        case 'resource':
          this._applyResourceEffect(actor, effect)
          break

        case 'resourceMaximum':
          this._applyResourceMaximumEffect(actor, effect)
          break
      }
    }
  }

  /**
   * Apply an effect to every configured target.
   */
  static _applyActorTraitEffect(actor, effect) {
    for (const target of this._getTargets(effect)) {
      const current = foundry.utils.getProperty(actor, target)

      if (current == null) continue

      /**
       * Actor fields expose their base and effective values
       *
       * Example:
       * system.attributes.dexterity.value
       * system.attributes.dexterity.effective
       */
      if (typeof current === 'object' && 'effective' in current) {
        current.effective = this.applyNumericEffect(current.effective, effect, actor)

        continue
      }

      console.warn(
        `World of Darkness 6th Edition | Cannot apply actor trait effect "${effect.sourceName}" to target "${target}".`,
        effect
      )
    }
  }

  /**
   * Apply an effect to a resource's current value.
   */
  static _applyResourceEffect(actor, effect) {
    for (const target of this._getTargets(effect)) {
      const resource = foundry.utils.getProperty(actor.system, target)

      if (!resource || typeof resource !== 'object') continue
      if (!('value' in resource)) continue

      resource.value = this.applyNumericEffect(resource.value, effect, actor)
    }
  }

  /**
   * Apply an effect to a resource's maximum value.
   */
  static _applyResourceMaximumEffect(actor, effect) {
    for (const target of this._getTargets(effect)) {
      const resource = foundry.utils.getProperty(actor.system, target)

      if (!resource || typeof resource !== 'object') continue
      if (!('max' in resource)) continue

      resource.max = this.applyNumericEffect(resource.max, effect, actor)

      if ('value' in resource && resource.value > resource.max) {
        resource.value = resource.max
      }
    }
  }

  /**
   * Generic numeric effect handler.
   */
  static applyNumericEffect(value, effect, actor = null) {
    const effectValue = this.resolveEffectValue(actor, effect)
    switch (effect.mode) {
      case 'add':
        return value + effectValue

      case 'subtract':
        return value - effectValue

      case 'override':
        return effectValue

      default:
        console.warn(
          `World of Darkness 6th Edition | Unknown effect mode "${effect.mode}".`,
          effect
        )

        return value
    }
  }

  static resolveEffectValue(actor, effect) {
    return resolveModifierValue(actor, effect)
  }

  /**
   * Return all effects applicable to a provided context.
   *
   * Example:
   *
   * {
   *   type: 'test',
   *   category: 'physical',
   *   action: 'dodge',
   *   attribute: 'dexterity',
   *   skill: 'athletics',
   *   tags: ['physical', 'defense']
   * }
   */
  static getApplicableEffects(actor, context = {}, { types = null } = {}) {
    let effects = actor.preparedEffects?.effects ?? []

    if (types) {
      const allowedTypes = Array.isArray(types) ? types : [types]

      effects = effects.filter((effect) => allowedTypes.includes(effect.type))
    }

    return effects.filter((effect) => this.effectMatchesContext(effect, context))
  }

  /**
   * Return all restrictions applicable to a provided context.
   */
  static getApplicableRestrictions(actor, context = {}, { types = null } = {}) {
    let restrictions = actor.preparedEffects?.restrictions ?? []

    if (types) {
      const allowedTypes = Array.isArray(types) ? types : [types]

      restrictions = restrictions.filter((restriction) => allowedTypes.includes(restriction.type))
    }

    return restrictions.filter((restriction) => this.effectMatchesContext(restriction, context))
  }

  /**
   * Convenience check for a particular restriction.
   */
  static hasRestriction(actor, type, context = {}) {
    return (
      this.getApplicableRestrictions(actor, context, {
        types: type
      }).length > 0
    )
  }

  /**
   * Determine whether an effect or restriction applies
   * to the supplied context.
   */
  static effectMatchesContext(effect, context = {}) {
    const tags = new Set(context.tags ?? [])

    const targets = new Set(effect.targets ?? [])
    const contextTargets = [context.attribute, context.skill, context.discipline]
      .flatMap((target) =>
        Array.isArray(target) || target instanceof Set ? [...target] : [target]
      )
      .filter(Boolean)

    if (targets.size > 0 && !contextTargets.some((target) => targets.has(target))) {
      return false
    }

    const predicates = Array.from(effect.predicates ?? [])
    const exclusions = Array.from(effect.exclusions ?? [])

    /**
     * Every predicate must match.
     */
    const matchesPredicates = predicates.every((predicate) =>
      this._matchesPredicate(predicate, tags, context)
    )

    if (!matchesPredicates) {
      return false
    }

    /**
     * Any exclusion prevents the effect.
     */
    const matchesExclusion = exclusions.some((exclusion) =>
      this._matchesPredicate(exclusion, tags, context)
    )

    return !matchesExclusion
  }

  /**
   * Match one predicate.
   *
   * Supports:
   *
   * physical
   * defense
   * action:dodge
   * attribute:dexterity
   *
   * And simple OR syntax:
   *
   * physical|mental
   */
  static _matchesPredicate(predicate, tags, context) {
    if (!predicate) return true

    const alternatives = predicate
      .split('|')
      .map((value) => value.trim())
      .filter(Boolean)

    return alternatives.some((value) => {
      if (tags.has(value)) {
        return true
      }

      const contextValues = [
        context.action,
        context.category,
        context.attribute,
        context.skill,
        context.discipline
      ]
        .flatMap((entry) => (Array.isArray(entry) || entry instanceof Set ? [...entry] : [entry]))
        .filter(Boolean)

      if (contextValues.includes(value)) {
        return true
      }

      const separatorIndex = value.indexOf(':')

      if (separatorIndex === -1) {
        return false
      }

      const key = value.slice(0, separatorIndex)
      const expected = value.slice(separatorIndex + 1)
      const actual = context[key]

      if (Array.isArray(actual)) {
        return actual.includes(expected)
      }

      return actual === expected
    })
  }

  /**
   * Normalize an effect's target collection.
   */
  static _getTargets(effect) {
    return Array.from(effect.targets ?? [])
  }

  static _initializeEffectiveValues(actor) {
    const collections = [
      actor.system.attributes,
      actor.system.skills,
      actor.system.vampire.disciplines
    ]

    for (const collection of collections) {
      if (!collection || typeof collection !== 'object') continue

      for (const entry of Object.values(collection)) {
        if (!entry || typeof entry !== 'object') continue
        if (!('value' in entry)) continue
        if (!('effective' in entry)) continue

        entry.effective = entry.value
      }
    }
  }
}
