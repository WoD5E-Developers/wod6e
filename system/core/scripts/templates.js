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
    'systems/wod6e/templates/splats/vampire/actors/parts/header.hbs',
    'systems/wod6e/templates/core/actors/parts/attributes.hbs',
    'systems/wod6e/templates/core/actors/parts/health.hbs',
    'systems/wod6e/templates/core/actors/parts/willpower.hbs',
    'systems/wod6e/templates/splats/vampire/actors/parts/humanity-scale.hbs',
    'systems/wod6e/templates/splats/vampire/actors/parts/left-column.hbs',
    'systems/wod6e/templates/splats/vampire/actors/parts/middle-column.hbs',
    'systems/wod6e/templates/splats/vampire/actors/parts/right-column.hbs',
    'systems/wod6e/templates/splats/vampire/actors/parts/disciplines.hbs',
    'systems/wod6e/templates/core/actors/parts/settings.hbs',
    'systems/wod6e/templates/core/actors/parts/limited-sheet.hbs'
  ]

  /* Load the template parts
   */
  return foundry.applications.handlebars.loadTemplates(templatePaths)
}
