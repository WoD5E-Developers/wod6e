import { _onRenderCompendiumBrowser } from '../applications/compendium-browser/scripts/on-render-compendium-browser.js'

/**
 * Define all additional keybindings here
 */
export const loadControls = async function () {
  // Keybinding for opening the compendium browser
  game.keybindings.register('wod6e', 'compendium-browser-open', {
    name: 'WOD6E.APPLICATIONS.CompendiumBrowserControlLabel',
    hint: 'WOD6E.APPLICATIONS.CompendiumBrowserControlHint',
    editable: [
      {
        key: 'KeyB'
      }
    ],
    onDown: () => _onRenderCompendiumBrowser()
  })
}
