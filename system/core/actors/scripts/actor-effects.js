export class ActorEffects {
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

      for (const effect of effects) {
        this.preparedEffects.effects.push({
          ...effect,
          sourceId: condition.id,
          sourceUuid: condition.uuid,
          sourceName: condition.name,
          sourceType: condition.type
        })
      }

      for (const restriction of restrictions) {
        this.preparedEffects.restrictions.push({
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
   * Apply effects which modify the Actor itself
   */
  static _applyActorEffects(actor) {
    const effects = actor.preparedEffects.effects

    for (const effect of effects) {
      switch (effect.type) {
        case 'rating':
          actor._applyRatingEffect(effect)
          break

        case 'resource':
          actor._applyResourceEffect(effect)
          break

        case 'resourceMaximum':
          actor._applyResourceMaximumEffect(effect)
          break
      }
    }
  }

  /**
   * Apply a temporary modification to an actor's traits
   */
  _applyRatingEffect(effect) {
    if (!effect.target) return

    const current = foundry.utils.getProperty(this.system, effect.target)

    if (current == null) return

    /**
     * This assumes the rating fields eventually exposes
     * an 'effective' value
     *
     * Example:
     * system.attributes.dexterity.value
     * system.attributes.dexterity.effective
     */
    if (typeof current === 'object' && 'effective' in current) {
      current.effective = this._applyNumericEffect(current.effective, effect)

      return
    }

    console.warn(
      `World of Darkness 6th Edition | Cannot apply rating effect "${effect.sourceName}" to target "${effect.target}".`,
      effect
    )
  }

  /**
   * Apply an effect to a resource's current value
   */
  _applyResourceEffect(effect) {
    if (!effect.target) return

    const resource = foundry.utils.getProperty(this.system, effect.target)

    if (!resource || typeof resource !== 'object') return
    if (!('value' in resource)) return

    resource.value = this._applyNumericEffect(resource.value, effect)
  }

  /**
   * Apply an effect to a resource's maximum value
   */
  _applyResourceMaximumEffect(effect) {
    if (!effect.target) return

    const resource = foundry.utils.getProperty(this.system, effect.target)

    if (!resource || typeof resource !== 'object') return
    if (!('max' in resource)) return

    resource.max = this._applyNumericEffect(resource.max, effect)

    if (resource.value > resource.max) {
      resource.value = resource.max
    }
  }

  /**
   * Generic numeric effect handler
   */
  _applyNumericEffect(value, effect) {
    switch (effect.mode) {
      case 'add':
        return value + effect.value

      case 'subtract':
        return value - effect.value

      case 'override':
        return effect.value

      default:
        console.warn(
          `World of Darkness 6th Edition | Unknown effect mode "${effect.mode}".`,
          effect
        )

        return value
    }
  }

  /**
   * Return all effects applicable to a provided context.
   *
   * Example context:
   * {
   *   type: 'test',
   *   category: 'physical',
   *   action: 'dodge',
   *   attribute: 'dexterity',
   *   skill: 'athletics',
   *   tags: [...]
   * }
   */
  getApplicableEffects(context = {}, { types = null } = {}) {
    let effects = this.preparedEffects?.effects ?? []

    if (types) {
      const allowedTypes = Array.isArray(types) ? types : [types]

      effects = effects.filter((effect) => allowedTypes.includes(effect.type))
    }

    return effects.filter((effect) => this.effectMatchesContext(effect, context))
  }

  /**
   * Return all restrictions applicable to a provided context
   */
  getApplicableRestrictions(context = {}, { types = null } = {}) {
    let restrictions = this.preparedEffects?.restrictions ?? []

    if (types) {
      const allowedTypes = Array.isArray(types) ? types : [types]

      restrictions = restrictions.filter((restriction) => allowedTypes.includes(restriction.type))
    }

    return restrictions.filter((restriction) => this.effectMatchesContext(restriction, context))
  }

  /**
   * Convenience check for a particular restriction
   */
  hasRestriction(type, context = {}) {
    return (
      this.getApplicableRestrictions(context, {
        types: type
      }).length > 0
    )
  }

  /**
   * Determine whether an effect or restriction applies
   * to the supplied context
   */
  effectMatchesContext(effect, context = {}) {
    const tags = new Set(context.tags ?? [])

    const predicates = []
    const excludes = []

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
    const matchesExclusion = excludes.some((exclude) =>
      this._matchesPredicate(exclude, tags, context)
    )

    return !matchesExclusion
  }

  /**
   * Match one predicate
   *
   * Supports:
   *
   * "physical"
   * "defense"
   * "action:dodge"
   * "attribute:dexterity"
   *
   * And simple OR syntax:
   *
   * "physical|mental"
   */
  _matchesPredicate(predicate, tags, context) {
    if (!predicate) return true

    const alternatives = predicate
      .split('|')
      .map((value) => value.trim())
      .filter(Boolean)

    return alternatives.some((value) => {
      if (tags.has(value)) {
        return true
      }

      const [key, expected] = value.split(':')

      if (!expected) {
        return false
      }

      return context[key] === expected
    })
  }
}
