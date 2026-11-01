const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../config');
const storage = require('../storage');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unregister')
    .setDescription('Removes a registration (and its role) for the given user. Use this to clean up test entries.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addUserOption((option) =>
      option.setName('user').setDescription('The player to unregister').setRequired(true)
    ),

  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const entry = storage.getEntry(target.id);

    if (!entry) {
      await interaction.reply({ content: `No registration found for ${target}.`, ephemeral: true });
      return;
    }

    storage.removeEntry(target.id);

    try {
      const member = await interaction.guild.members.fetch(target.id);
      await member.roles.remove([config.registeredRoleId, config.standbyRoleId]);
    } catch (err) {
      console.error(`Could not remove roles from ${target.id}:`, err.message);
    }

    const sheetsNote = config.sheets.sheetId
      ? ' If Google Sheets logging is on, delete their row there too, this command only clears Discord and the local file.'
      : '';

    await interaction.reply({
      content: `Removed ${target}'s registration (was: ${entry.status}).${sheetsNote}`,
      ephemeral: true,
    });
  },
};
