const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function registrationEmbed() {
  const embed = new EmbedBuilder()
    .setTitle('Alpha Sector Duo Cup — Registration')
    .setDescription(
      'Click **Register** below to start. You will need:\n\n' +
        '1. Your Brawlhalla ID\n' +
        '2. Your platform (Steam, console, mobile)\n' +
        '3. Your Steam profile link (if on Steam)\n' +
        '4. A screenshot of your 2v2 ranked stats (current and peak ELO), sent to the bot by DM right after\n\n' +
        'Only 16 spots. After that you go on the standby list. ELO is frozen 5 days before the event.'
    )
    .setColor(0x7f77dd);

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('duo_cup_register').setLabel('Register').setStyle(ButtonStyle.Primary)
  );

  return { embeds: [embed], components: [row] };
}

function dmInstructionsEmbed() {
  return new EmbedBuilder()
    .setTitle('One more step')
    .setDescription(
      'Reply here with a screenshot of your 2v2 ranked stats, showing both your current and peak ELO. ' +
        'That completes your registration.'
    )
    .setColor(0x7f77dd);
}

function confirmationEmbed(entry) {
  const embed = new EmbedBuilder().setColor(entry.status === 'registered' ? 0x639922 : 0xba7517);

  if (entry.status === 'registered') {
    embed.setTitle("You're in").setDescription(
      'Registered for the Alpha Sector Duo Cup.\n\n' +
        `**Brawlhalla ID:** ${entry.brawlhallaId}\n` +
        `**Platform:** ${entry.platform}\n\n` +
        'ELO freezes 5 days before the event. Check-in opens 45 minutes before your round and closes 15 ' +
        'minutes before. Watch #registration for updates.'
    );
  } else {
    embed.setTitle("You're on the standby list").setDescription(
      `All 16 spots were already filled. You're #${entry.standbyPosition || '?'} on standby.\n\n` +
        "If a registered team drops, standby entries are promoted in order. You'll get a DM if that happens."
    );
  }

  return embed;
}

function adminLogEmbed(entry) {
  return new EmbedBuilder()
    .setTitle(`New ${entry.status === 'registered' ? 'registration' : 'standby entry'}`)
    .addFields(
      { name: 'Discord', value: `<@${entry.userId}> (${entry.username})`, inline: true },
      { name: 'Brawlhalla ID', value: entry.brawlhallaId, inline: true },
      { name: 'Platform', value: entry.platform, inline: true },
      { name: 'Steam', value: entry.steamLink || 'not provided' },
      {
        name: 'Status',
        value: entry.status === 'registered' ? 'Registered' : `Standby #${entry.standbyPosition}`,
      }
    )
    .setColor(entry.status === 'registered' ? 0x639922 : 0xba7517)
    .setImage(entry.screenshotUrl)
    .setTimestamp(new Date(entry.registeredAt));
}

module.exports = { registrationEmbed, dmInstructionsEmbed, confirmationEmbed, adminLogEmbed };
