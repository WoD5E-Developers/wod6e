export const _onAddTest = async function (event) {
  event.preventDefault()

  const item = this.item

  const tests = Array.from(item.system.tests ?? []).map((test) => ({
    attributes: Array.from(test.attributes ?? []),
    skills: Array.from(test.skills ?? []),
    disciplines: Array.from(test.disciplines ?? []),
    description: test.description ?? ''
  }))

  tests.push({
    attributes: [],
    skills: [],
    disciplines: [],
    description: ''
  })

  await item.update({
    'system.tests': tests
  })
}

export const _onDeleteTest = async function (event, target) {
  event.preventDefault()

  const item = this.item
  const index = Number(target.dataset.index)

  if (!Number.isInteger(index)) return

  const tests = Array.from(item.system.tests ?? []).map((test) => ({
    attributes: Array.from(test.attributes ?? []),
    skills: Array.from(test.skills ?? []),
    disciplines: Array.from(test.disciplines ?? []),
    description: test.description ?? ''
  }))

  tests.splice(index, 1)

  await item.update({
    'system.tests': tests
  })
}
