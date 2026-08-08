export async function buildEnrichedField({ path = '', value = '' }) {
  return {
    path,
    value,
    enriched: await foundry.applications.ux.TextEditor.implementation.enrichHTML(value ?? '')
  }
}
