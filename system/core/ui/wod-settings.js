export class WoDSettings extends foundry.applications.sidebar.tabs.Settings {
  async _onRender(context, options) {
    await super._onRender(context, options)

    const html = this.element

    // Additional system information resources
    const systemRow = html.querySelectorAll('.settings-sidebar .info .system')
    const systemLinks = `<div class='external-system-links'>
        <a href='https://github.com/WoD5E-Developers/wod6e/releases' target='_blank'>${game.i18n.localize('WOD6E.SIDEBARS.Changelog')}</a>
        |
        <a href='https://github.com/WoD5E-Developers/wod6e/issues' target='_blank'>${game.i18n.localize('WOD6E.SIDEBARS.ReportAnIssue')}</a>
      </div>`
    systemRow.forEach((row) => {
      row.insertAdjacentHTML('afterend', systemLinks)
    })

    // License Section
    const accessSection = html.querySelectorAll('.settings-sidebar .access')
    const licenseInformation = `<section class="license flexcol">
      <h4 class="divider">${game.i18n.localize('WOD6E.SIDEBARS.LicensedUnderDarkPack')}</h4>
        <section class="info" id='license-information'>
          ${game.i18n.localize('WOD6E.SIDEBARS.LicensedUnderDarkPackFulltext')}
        </section>
    </section>`
    accessSection.forEach((section) => {
      section.insertAdjacentHTML('afterend', licenseInformation)
    })
  }
}
