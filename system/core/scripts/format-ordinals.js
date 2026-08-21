// Thank you MDN for the documentation on Intl.PluralRules
export const formatOrdinals = (n) => {
  const enOrdinalRules = new Intl.PluralRules('en-US', { type: 'ordinal' })

  const suffixes = new Map([
    ['one', 'st'],
    ['two', 'nd'],
    ['few', 'rd'],
    ['other', 'th']
  ])

  const rule = enOrdinalRules.select(n)
  const suffix = suffixes.get(rule)
  return `${n}${suffix}`
}
