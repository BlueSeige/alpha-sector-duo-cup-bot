const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const storage = require('../storage');

module.exports = {
  customId: 'duo_cup_register',

  async execute(interaction) {
    if (storage.hasActiveEntry(interaction.user.id)) {
      await interaction.reply({
        content:
          "You've already registered (or you're on standby). Check your DMs if you're waiting on a screenshot.",
        ephemeral: true,
      });
      return;
    }

    const modal = new ModalBuilder().setCustomId('duo_cup_register_modal').setTitle('Duo Cup Registration');

    const brawlhallaId = new TextInputBuilder()
      .setCustomId('brawlhalla_id')
      .setLabel('Brawlhalla ID')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const platform = new TextInputBuilder()
      .setCustomId('platform')
      .setLabel('Platform (Steam, console, mobile)')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const steamLink = new TextInputBuilder()
      .setCustomId('steam_link')
      .setLabel('Steam profile link (leave blank if N/A)')
      .setStyle(TextInputStyle.Short)
      .setRequired(false);

    modal.addComponents(
      new ActionRowBuilder().addComponents(brawlhallaId),
      new ActionRowBuilder().addComponents(platform),
      new ActionRowBuilder().addComponents(steamLink)
    );

    await interaction.showModal(modal);
  },
};
