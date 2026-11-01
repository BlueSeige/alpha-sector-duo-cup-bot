require('dotenv').config();

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Check your .env file against .env.example.`
    );
  }
  return value;
}

const config = {
  token: required('DISCORD_TOKEN'),
  clientId: required('CLIENT_ID'),
  guildId: required('GUILD_ID'),
  registrationChannelId: required('REGISTRATION_CHANNEL_ID'),
  adminLogChannelId: required('ADMIN_LOG_CHANNEL_ID'),
  registeredRoleId: required('REGISTERED_ROLE_ID'),
  standbyRoleId: required('STANDBY_ROLE_ID'),
  maxSlots: parseInt(process.env.MAX_SLOTS || '16', 10),
  sheets: {
    sheetId: process.env.GOOGLE_SHEETS_ID || null,
    serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || null,
    // .env files store newlines as literal "\n", turn them back into real
    // newlines or the private key won't parse.
    privateKey: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
      ? process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n')
      : null,
  },
};

module.exports = config;
