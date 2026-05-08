// Erstatt ALT i Apps Script-editoren med denne koden
// Husk å lage NY implementering etterpå (ikke oppdater gammel)

function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Tidspunkt', 'Navn', 'Kommer', 'Antall gjester', 'Allergier', 'Hilsen']);
  }

  sheet.appendRow([
    e.parameter.timestamp,
    e.parameter.name,
    e.parameter.attending,
    e.parameter.guests,
    e.parameter.allergies,
    e.parameter.message,
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}
