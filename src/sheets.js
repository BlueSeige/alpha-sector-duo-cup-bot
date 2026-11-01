const config = require('./config');

let sheetsClient = null;

async function getClient() {
  if (!config.sheets.sheetId) return null;
  if (sheetsClient) return sheetsClient;

  const { google } = require('googleapis');
  const auth = new google.auth.JWT(
    config.sheets.serviceAccountEmail,
    null,
    config.sheets.privateKey,
    ['https://www.googleapis.com/auth/spreadsheets']
  );
  sheetsClient = google.sheets({ version: 'v4', auth });
  return sheetsClient;
}

// Columns match the tracker described in the Helper Guide doc:
// Timestamp, Discord username, Brawlhalla ID, Platform, Steam profile link,
// Claimed ELO, Screenshot link, Status, Verified by, Payment status
async function appendRow(entry) {
  const sheets = await getClient();
  if (!sheets) return; // Sheets not configured, the local JSON file is the only record

  const row = [
    entry.registeredAt,
    entry.username,
    entry.brawlhallaId,
    entry.platform,
    entry.steamLink,
    '', // claimed ELO, left for the helper to fill in from the screenshot
    entry.screenshotUrl,
    entry.status === 'registered' ? 'Registered' : 'Standby',
    '', // verified by
    '', // payment status
  ];

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: config.sheets.sheetId,
      range: 'Sheet1!A:J',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [row] },
    });
  } catch (err) {
    console.error('Failed to log registration to Google Sheets:', err.message);
    // Don't throw. data/registrations.json still has the record either way.
  }
}

module.exports = { appendRow };
