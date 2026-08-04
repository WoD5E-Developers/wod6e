/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  // Define template paths to load
  const templatePaths = [
    // Generic partials
    'templates/generic/tab-navigation.hbs',
    'systems/wod6e/templates/core/fields/multi-select.hbs',

    // Core actor templates
    'systems/wod6e/templates/core/actors/parts/attributes.hbs',
    'systems/wod6e/templates/core/actors/parts/health.hbs',
    'systems/wod6e/templates/core/actors/parts/willpower.hbs',
    'systems/wod6e/templates/core/actors/parts/settings.hbs',
    'systems/wod6e/templates/core/actors/parts/limited-sheet.hbs',
    'systems/wod6e/templates/core/actors/parts/avatar.hbs',
    'systems/wod6e/templates/core/actors/parts/equipment.hbs',
    'systems/wod6e/templates/core/actors/parts/skills.hbs',
    'systems/wod6e/templates/core/actors/parts/lifepaths.hbs',
    'systems/wod6e/templates/core/actors/parts/merits.hbs',
    'systems/wod6e/templates/core/actors/parts/flaws.hbs',
    'systems/wod6e/templates/core/actors/parts/resources.hbs',

    // Core item templates
    'systems/wod6e/templates/core/items/resource-item-sheet.hbs',
    'systems/wod6e/templates/core/items/parts/data-item-id.hbs',
    'systems/wod6e/templates/core/items/parts/description.hbs',
    'systems/wod6e/templates/core/items/parts/item-settings.hbs',
    'systems/wod6e/templates/core/items/parts/source.hbs',

    // Vampire actor templates
    'systems/wod6e/templates/splats/vampire/actors/parts/header.hbs',
    'systems/wod6e/templates/splats/vampire/actors/parts/humanity-scale.hbs',
    'systems/wod6e/templates/splats/vampire/actors/parts/left-column.hbs',
    'systems/wod6e/templates/splats/vampire/actors/parts/middle-column.hbs',
    'systems/wod6e/templates/splats/vampire/actors/parts/right-column.hbs',
    'systems/wod6e/templates/splats/vampire/actors/parts/disciplines.hbs',
    'systems/wod6e/templates/splats/vampire/actors/parts/nature.hbs',
    'systems/wod6e/templates/splats/vampire/actors/parts/beast.hbs',
    'systems/wod6e/templates/splats/vampire/actors/parts/clan-traits.hbs',

    // Vampire item templates
    'systems/wod6e/templates/splats/vampire/items/discipline-item-sheet.hbs',
    'systems/wod6e/templates/splats/vampire/items/clan-item-sheet.hbs',
    'systems/wod6e/templates/splats/vampire/items/parts/clan-beast.hbs',
    'systems/wod6e/templates/splats/vampire/items/parts/clan-curse.hbs',
    'systems/wod6e/templates/splats/vampire/items/parts/clan-discipline-selection.hbs',
    'systems/wod6e/templates/splats/vampire/items/parts/clan-frenzy.hbs'
  ]

  /* Load the template parts
   */
  return foundry.applications.handlebars.loadTemplates(templatePaths)
}
