import { ActorEffects } from './scripts/actor-effects.js'
import { generateHealthMax, generateWillpowerMax } from './scripts/resource-max-calculations.js'

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

    const tokenUpdate = {}

    // Link non-SPC token data by default
    if (data.prototypeToken?.actorLink === undefined && data.type !== 'spc') {
      tokenUpdate.actorLink = true
    }

    if (!foundry.utils.isEmpty(tokenUpdate)) {
      this.prototypeToken.updateSource(tokenUpdate)
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
