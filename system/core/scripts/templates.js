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

    // Dialog partials
    'systems/wod6e/templates/core/dialogs/roll-dialog-side-panel.hbs',

    // Item chat card partials
    'systems/wod6e/templates/core/chat/base-item.hbs',
    'systems/wod6e/templates/core/chat/parts/activation.hbs',
    'systems/wod6e/templates/core/chat/parts/difficulty.hbs',
    'systems/wod6e/templates/core/chat/parts/prerequisites.hbs',
    'systems/wod6e/templates/core/chat/parts/test.hbs',

    // Core actor templates
    'systems/wod6e/templates/core/actors/parts/attributes.hbs',
    'systems/wod6e/templates/core/actors/parts/health-willpower.hbs',
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
    'systems/wod6e/templates/core/actors/npc/header.hbs',
    'systems/wod6e/templates/core/actors/npc/levels.hbs',

    // Core item templates
    'systems/wod6e/templates/core/items/parts/item-image.hbs',
    'systems/wod6e/templates/core/items/parts/item-name.hbs',
    'systems/wod6e/templates/core/items/parts/data-item-id.hbs',
    'systems/wod6e/templates/core/items/parts/descriptive-item-page.hbs',
    'systems/wod6e/templates/core/items/parts/item-settings.hbs',
    'systems/wod6e/templates/core/items/parts/source.hbs',

    // Core application templates
    'systems/wod6e/templates/core/applications/compendium-browser/sidebar.hbs',
    'systems/wod6e/templates/core/applications/compendium-browser/body.hbs',
    'systems/wod6e/templates/core/applications/compendium-browser/parts/filter-splats.hbs',
    'systems/wod6e/templates/core/applications/compendium-browser/parts/filter-types.hbs',
    'systems/wod6e/templates/core/applications/quickening-drama-tracker/body.hbs',

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
    'systems/wod6e/templates/splats/vampire/items/parts/clan-discipline-selection.hbs',
    'systems/wod6e/templates/splats/vampire/items/parts/discipline-maturing-page.hbs'
  ]

  /* Load the template parts
   */
  return foundry.applications.handlebars.loadTemplates(templatePaths)
}
