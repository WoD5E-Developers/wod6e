import { ActorEffects } from './scripts/actor-effects.js'
import {
  generateHealthMax,
  generateWillpowerMax,
  getNpcResourceDefaults
} from './scripts/resource-max-calculations.js'
import { generateVitaeMax, getHunger } from './scripts/vitae.js'
import { createPathItemData } from '../../splats/vampire/scripts/paths.js'
import { createInitialAttributes } from './data-models/fields/attribute-fields.js'
import { NpcTiers } from '../config/npc-tiers.js'

function addMissingNpcAttributes(system, updates) {
  if (!NpcTiers.getDefinition(system.tier).usesDetailedTraits) return

  for (const [key, initial] of Object.entries(createInitialAttributes())) {
    if (system.attributes?.[key]) continue
    system.attributes ??= {}
    updates.attributes ??= {}
    system.attributes[key] = initial
    updates.attributes[key] = initial
  }
}

/**
 * Extend the base ActorSheet document and put all our base functionality here
 * @extends {Actor}
 */
export class WoDActor extends Actor {
  /**
   * @override
   * Handle data that happens before the creation of a new actor document
   */
  async _preCreate(data, context, user) {
    await super._preCreate(data, context, user)

    // Set some default NPC values
    if (this.type === 'npc') {
      const system = this.toObject().system
      const update = { system: {} }
      addMissingNpcAttributes(system, update.system)
      const defaults = getNpcResourceDefaults(system)

      for (const [resource, defaultMax] of Object.entries(defaults)) {
        const supplied = data.system?.[resource]
        const max = supplied?.max ?? defaultMax
        const effectiveMax = resource === 'health' && this.system.isMinion ? 1 : max
        const usableMax = Math.max(0, effectiveMax - system[resource].disabled)

        update.system[resource] = {
          max,
          value: Math.min(supplied?.value ?? usableMax, usableMax)
        }
      }

      this.updateSource(update)
    }

    if (data.type === 'vampire') {
      const items = data.items ?? []
      this.updateSource({
        ...(!items.some((item) => item.type === 'path')
          ? { items: [...items, createPathItemData()] }
          : {}),
        'flags.wod6e.humanityAlpha2': 2
      })
    }

    const tokenUpdate = {}

    // Link non-SPC token data by default
    if (data.prototypeToken?.actorLink === undefined && data.type !== 'spc') {
      tokenUpdate.actorLink = true
    }

    if (!foundry.utils.isEmpty(tokenUpdate)) {
      this.prototypeToken.updateSource(tokenUpdate)
    }
  }

  // Check if the update includes NPC tier; if so, initialize defaults
  // or constraints for NPCs
  async _preUpdate(changed, options, user) {
    // Cancel our updates if the parent function returns false too
    const allowed = await super._preUpdate(changed, options, user)
    if (allowed === false) return false

    // Only proceed if this is an NPC
    if (this.type !== 'npc' || (changed.type && changed.type !== 'npc') || !changed.system?.tier) {
      return
    }

    // We don't need to do the below logic if the tier hasn't changed
    const currentTier = this.system.isMinion ? 'minion' : this.system.tier
    if (changed.system.tier === currentTier) return

    const system = foundry.utils.mergeObject(this.toObject().system, changed.system)

    // Check if the attributes are 0 like they are on older NPCs
    addMissingNpcAttributes(system, changed.system)

    // Get the defaults and update the actor
    const defaults = getNpcResourceDefaults(system)
    for (const [resource, defaultMax] of Object.entries(defaults)) {
      const update = (changed.system[resource] ??= {})
      update.max ??= defaultMax
      const effectiveMax =
        resource === 'health' && changed.system.tier === 'minion' ? 1 : update.max
      const usableMax = Math.max(0, effectiveMax - system[resource].disabled)
      update.value = Math.min(update.value ?? this.system[resource].value, usableMax)
    }
  }

  /**
   * @override
   * Prepare data for the actor. Calling the super version of this executes
   * the following, in order: data reset (to clear active effects),
   * prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
   * prepareDerivedData().
   */
  prepareData() {
    // This exists because if an actor exists from another system (such as "Vampire" from WOD20),
    // the prepareData function will get stuck in a loop. For some reason Foundry isn't registering
    // those kinds of actors as invalid, and thus this is a quick way to make sure people can
    // still load their worlds with those invalid actors.
    if (game.actors.invalidDocumentIds.has(this.id)) {
      return
    }

    super.prepareData()
  }

  /**
   * @override
   * Data modifications in this step occur before processing embedded
   * documents or derived data.
   */
  async prepareBaseData() {
    super.prepareBaseData()
  }

  async prepareEmbeddedDocuments() {
    super.prepareEmbeddedDocuments()
  }

  /**
   * @override
   * Augment the actor source data with additional dynamic data. Typically,
   * you'll want to handle most of your calculated/derived data in this step.
   * Data calculated in this step should generally not exist in template.json
   * (such as ability modifiers rather than ability scores) and should be
   * available both inside and outside of character sheets (such as if an actor
   * is queried and has a roll executed directly from it).
   */
  async prepareDerivedData() {
    super.prepareDerivedData()

    const actor = this
    const systemData = actor.system

    // Prepare conditions (and maybe eventually other actor effects)
    ActorEffects._initializePreparedEffects(actor)
    // Reset derived values BEFORE applying effects
    ActorEffects._initializeEffectiveValues(this)
    // Handle the applying of the effects tot he actor
    ActorEffects._prepareConditionEffects(actor)
    ActorEffects._applyActorEffects(actor)

    if (systemData.health) {
      systemData.health.max = generateHealthMax(this)
      systemData.health.value = Math.clamp(
        systemData.health.value,
        0,
        Math.max(0, systemData.health.max - systemData.health.disabled)
      )
    }

    if (systemData.willpower) {
      systemData.willpower.max = generateWillpowerMax(this)
      systemData.willpower.value = Math.clamp(
        systemData.willpower.value,
        0,
        Math.max(0, systemData.willpower.max - systemData.willpower.disabled)
      )
    }

    if (systemData.vitae) {
      systemData.vitae.max = generateVitaeMax(this)
      systemData.vitae.disabled = 0
      systemData.vitae.value = Math.clamp(systemData.vitae.value, 0, systemData.vitae.max)
      systemData.hunger = { value: getHunger(this) }
    }

    // If the actor is a player, update the default permissions to limited
    if (
      actor.hasPlayerOwner &&
      !actor.getFlag('wod6e', 'manualDefaultOwnership') &&
      game.user.isGM
    ) {
      await actor.update({ 'ownership.default': CONST.DOCUMENT_OWNERSHIP_LEVELS.LIMITED })
    }
  }

  /**
   * @override
   * Handle things that need to be done every update or specifically when the actor is being updated
   */
  async _onUpdate(data, options, user) {
    const actor = game.actors.get(data._id)

    // Handle the actual update
    super._onUpdate(data, options, user)

    // Only run through this for the storyteller
    if (!game.user.isGM) return

    // Make sure the actor exists
    if (!actor) return

    // If the default ownership is ever not limited, update the manualDefaultOwnership flag
    if (actor.ownership.default !== CONST.DOCUMENT_OWNERSHIP_LEVELS.LIMITED) {
      await actor.setFlag('wod6e', 'manualDefaultOwnership', true)
    }
  }
}
