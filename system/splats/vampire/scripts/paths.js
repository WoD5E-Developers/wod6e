// Alpha 2 Player Guide, pp. 128-134. Summaries retain the published mechanical scope.
export const PATHS = {
  humanity: {
    name: 'Humanity',
    page: '128',
    description: 'Hold on to human values and compassion to keep the Beast under control.',
    teachings:
      'Apply your rank modifier to positive interactions with mortals, including empathy and friendliness.',
    precepts: [
      [
        'Remain human to resist the Beast.',
        'Act monstrously or let the Beast dictate your choices. Frenzy itself is not automatically a violation.'
      ],
      [
        'Remind other vampires of their shared humanity.',
        'Allow companions to act monstrously when you could intervene.'
      ],
      [
        'Respect human boundaries and well-being; feeding need not be cruel.',
        'Violate mortal boundaries or well-being for personal gain or amusement.'
      ],
      ['Recognize the value of every human.', 'Treat mortals as inferiors or mere food.'],
      [
        'Distinguish yourself from the Beast through thought and compassion.',
        'Choose cruelty or bestial behavior when you could control yourself.'
      ]
    ]
  },
  caine: {
    name: 'Path of Caine',
    page: '130',
    resistanceTeaching: true,
    description:
      'Study Caine and the Book of Nod to understand vampiric existence and master the undead form.',
    teachings:
      "Apply your rank modifier when emulating Caine's resolve, studying ancient scripture, or resisting the Beast.",
    precepts: [
      ['Exercise restraint and avoid extremes.', 'Choose to ride the wave of a frenzy.'],
      [
        'Develop willpower and predatory instinct to master the Beast.',
        'Act weak-willed or choose not to hunt.'
      ],
      [
        'Take the Vitae of the unworthy to draw closer to Caine.',
        'Pass up an opportunity to diablerize a humane vampire.'
      ],
      [
        'Explore your powers and the meaning of vampirism.',
        'Neglect an opportunity to develop powers or test your cursed nature.'
      ],
      ['Study the history and actions of Caine.', 'Ignore an opportunity to pursue vampiric lore.'],
      [
        'Accept that you are no longer human.',
        'Befriend mortals or become involved in their mundane affairs.'
      ]
    ]
  },
  honor: {
    name: 'Path of Honor',
    page: '131',
    description:
      'Use a firm code of honor, duty, and personal obligation to hold the Beast at bay.',
    teachings:
      'Apply your rank modifier to tests of maintaining your resolve or fulfilling your word.',
    precepts: [
      [
        'Keep your word and honor agreements.',
        'Break your word or act treacherously in an agreement.'
      ],
      [
        'Overcome fear and reject cowardice.',
        'Show cowardice, flee a challenge, or choose to ride a fear frenzy.'
      ],
      ['Put duty before personal concerns.', 'Put personal interests above your obligations.'],
      [
        'Treat equals and superiors fairly; disdain those beneath you.',
        'Disobey your leader, mistreat peers, or associate with the dishonorable.'
      ],
      [
        'Support allies unless they act treacherously.',
        'Fail to help or protect an ally who has not acted treacherously.'
      ]
    ]
  },
  power: {
    name: 'Path of Power',
    page: '132',
    description:
      'Pursue mastery of yourself and dominion over others through influence, strategy, and power.',
    teachings:
      'Apply your rank modifier when intimidating, punishing, or exercising power over others.',
    precepts: [
      [
        'Punish failure swiftly, including your own.',
        'Leave failure unpunished or deny responsibility for your actions.'
      ],
      [
        'Care for followers, but reward sparingly to demand excellence.',
        'Treat underlings poorly or reward them too frequently.'
      ],
      [
        'Bend the surrounding world to your will.',
        'Miss an opportunity to exploit others or help without benefiting yourself.'
      ],
      [
        'Use hate, fear, and anger while appearing benevolent.',
        'Refuse these tools when they would let you control others.'
      ],
      [
        'Act from strength and never show weakness.',
        'Reject an opportunity for power or accept defeat.'
      ]
    ]
  },
  temptation: {
    name: 'Path of Temptation',
    page: '133',
    description:
      'Embrace the role of a corruptor, spreading vice and material temptation to master your own Beast.',
    teachings:
      'Apply your rank modifier when tempting others toward debasement, sin, or indulgence.',
    precepts: [
      [
        'Indulge in vice, wealth, sensuality, and material power.',
        'Exercise restraint when an opportunity for vice appears.'
      ],
      ['Lead others into temptation.', 'Encourage restraint or help someone resist temptation.'],
      [
        'Embrace those with great passion and little restraint.',
        'Embrace someone unworthy of temptation or refuse someone who has proved worthy.'
      ],
      [
        'Expect corruption and betrayal from the material world.',
        'Trust someone completely without preparing for betrayal.'
      ],
      [
        'Tempt mortals toward damnation instead of killing needlessly.',
        'Kill a mortal needlessly without first tempting their soul.'
      ]
    ]
  },
  beast: {
    name: 'Path of the Beast',
    page: '134',
    description:
      'Live as a deliberate predator, balancing the Beast with intelligence and cunning.',
    teachings: 'Apply your rank modifier to hunting, survival, and instinctive animal behavior.',
    precepts: [
      ['Put survival first.', 'Risk your life for someone else.'],
      [
        'Keep politics and technology out of the hunt.',
        'Hunt with technology or engage in politics unrelated to hunting.'
      ],
      [
        'Balance necessary bestial acts with intelligence.',
        'Constantly deny the Beast or abandon all rationality and cunning.'
      ],
      [
        'Live according to your true vampiric form.',
        'Ignore your monstrous nature and pretend to be mortal.'
      ],
      [
        'Master fear so enemies cannot exploit it.',
        'Flee frightening things unless flight is necessary to survive.'
      ],
      [
        'Remain absolutely loyal to your coterie.',
        'Betray a companion or ally you consider part of your coterie.'
      ]
    ]
  }
}

export function createPathItemData(key = 'humanity') {
  const path = PATHS[key] ?? PATHS.humanity
  return {
    name: path.name,
    type: 'path',
    img: 'systems/wod6e/assets/actors/VampireSymbol.webp',
    system: {
      pathType: PATHS[key] ? key : 'humanity',
      description: `<p>${path.description}</p>`,
      teachings: path.teachings,
      resistanceTeaching: path.resistanceTeaching ?? false,
      precepts: path.precepts.map(([precept, violation]) => ({ precept, violation })),
      source: { book: 'VTM Alpha 2.0 Player Guide', page: path.page }
    },
    flags: { wod6e: { dataItemId: `path-${key}` } }
  }
}
