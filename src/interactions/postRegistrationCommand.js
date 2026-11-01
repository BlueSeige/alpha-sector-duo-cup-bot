const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { registrationEmbed } = require('../lib/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('post-registration')
    .setDescription('Posts the Duo Cup registration embed with the Register button in this channel.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    await interaction.channel.send(registrationEmbed());
    await interaction.reply({ content: 'Posted.', ephemeral: true });
  },
};
