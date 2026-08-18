export function generationDetailLookup(generation) {
  const category = Object.values(WOD6E.configs.GenerationCategories).find((type) =>
    type?.generations?.includes(generation)
  )

  return category
}
