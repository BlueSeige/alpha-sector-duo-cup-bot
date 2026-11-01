const { Client, GatewayIntentBits, Partials, Events, Collection } = require('discord.js');
const config = require('./config');

const postRegistrationCommand = require('./interactions/postRegistrationCommand');
const unregisterCommand = require('./interactions/unregisterCommand');
const registerButton = require('./interactions/registerButton');
const registerModal = require('./interactions/registerModal');
const dmScreenshot = require('./interactions/dmScreenshot');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel, Partials.Message],
});

client.commands = new Collection();
client.commands.set(postRegistrationCommand.data.name, postRegistrationCommand);
client.commands.set(unregisterCommand.data.name, unregisterCommand);

client.once(Events.ClientReady, (c) => {
  console.log(`Logged in as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (command) await command.execute(interaction);
    } else if (interaction.isButton() && interaction.customId === registerButton.customId) {
      await registerButton.execute(interaction);
    } else if (interaction.isModalSubmit() && interaction.customId === registerModal.customId) {
      await registerModal.execute(interaction);
    }
  } catch (err) {
    console.error('Interaction error:', err);
    if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
      await interaction
        .reply({ content: 'Something went wrong, try again or ping an admin.', ephemeral: true })
        .catch(() => {});
    }
  }
});

client.on(Events.MessageCreate, (message) => {
  dmScreenshot.execute(message, client).catch((err) => console.error('DM handler error:', err));
});

client.login(config.token);
