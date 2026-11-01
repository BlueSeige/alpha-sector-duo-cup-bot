const storage = require('../storage');
const { dmInstructionsEmbed } = require('../lib/embeds');

module.exports = {
  customId: 'duo_cup_register_modal',

  async execute(interaction) {
    const brawlhallaId = interaction.fields.getTextInputValue('brawlhalla_id').trim();
    const platform = interaction.fields.getTextInputValue('platform').trim();
    const steamLink = interaction.fields.getTextInputValue('steam_link').trim();

    if (storage.hasActiveEntry(interaction.user.id)) {
      await interaction.reply({ content: "You've already registered.", ephemeral: true });
      return;
    }

    storage.addPending({
      userId: interaction.user.id,
      username: interaction.user.username,
      brawlhallaId,
      platform,
      steamLink,
    });

    try {
      await interaction.user.send({ embeds: [dmInstructionsEmbed()] });
      await interaction.reply({
        content: 'Check your DMs, send a screenshot of your 2v2 ranked ELO there to finish up.',
        ephemeral: true,
      });
    } catch (err) {
      // DMs are closed. Undo the pending entry so they can retry once DMs are open.
      storage.removeEntry(interaction.user.id);
      await interaction.reply({
        content:
          "Couldn't DM you, your DMs from server members might be off. " +
          'Enable them (Privacy Settings in this server) and click Register again.',
        ephemeral: true,
      });
    }
  },
};
