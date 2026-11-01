const { REST, Routes } = require('discord.js');
const config = require('./src/config');
const postRegistrationCommand = require('./src/interactions/postRegistrationCommand');
const unregisterCommand = require('./src/interactions/unregisterCommand');

const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
  try {
    console.log('Registering slash commands...');
    await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), {
      body: [postRegistrationCommand.data.toJSON(), unregisterCommand.data.toJSON()],
    });
    console.log('Done. /post-registration is live in your server.');
  } catch (err) {
    console.error(err);
  }
})();
