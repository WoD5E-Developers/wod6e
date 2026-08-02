import { generateTrackers } from '../../../../../core/actors/scripts/generate-trackers.js'
import { prepareSkills } from '../../../../../core/actors/scripts/prepare-skills.js'

export const prepareHeaderContext = async function (context, actor) {
  const actorData = actor.system

  context.name = actor.name
  context.archetype = actorData.archetype
  context.age = actorData.age
  context.vampire = actorData.vampire

  return context
}

export const prepareHumanityScaleContext = async function (context, actor) {
  const actorData = actor.system
  const humanity = actorData.vampire.humanity

  context.humanity = {
    trackers: generateTrackers({
      value: humanity.value,
      max: humanity.max,
      groupSize: 100,
      onlyCurrentValueSelected: true
    })
  }

  return context
}

export const prepareLeftColumnContext = async function (context, actor) {
  context.skills = prepareSkills(actor)

  return context
}

export const prepareMiddleColumnContext = async function (context) {
  context.equipment = [
    {
      name: 'Butterfly Knife (Light Melee, 2 damage)'
    },
    {
      name: 'Stolen Car Keys'
    },
    {
      name: 'Fake ID (Marie Lynn)'
    }
  ]

  return context
}

export const prepareRightColumnContext = async function (context) {
  context.lifepaths = [
    {
      name: 'Artist',
      description:
        'You were a writer, actor, painter, designer, or operated within some other creative sphere of society.'
    },
    {
      name: 'Criminal',
      description: 'You made your living by breaking the law.'
    }
  ]

  context.clanTraits = [
    {
      name: 'Prowess',
      description: 'You deal extra damage with your punches and melee weapons.'
    },
    {
      name: 'Spark of Rage',
      description:
        'You can easily incite anger and violence in others. You can activate this trait.'
    }
  ]

  context.merits = [
    {
      name: 'Might',
      description: 'Most feats of strength are effortless for you. You can activate this trait.'
    }
  ]

  context.flaws = [
    {
      name: 'Uncontrollable Strength',
      description:
        "You often can't control your strength, brekaing objects you were trying to use, or hurting those you didn't intend to hurt."
    }
  ]

  return context
}

export const prepareDisciplinesContext = async function (context) {
  return context
}
