const { ChannelType } = require('discord.js');
const config = require('../config');
const storage = require('../storage');
const sheets = require('../sheets');
const { confirmationEmbed, adminLogEmbed } = require('../lib/embeds');

module.exports = {
  async execute(message, client) {
    if (message.author.bot) return;
    if (message.channel.type !== ChannelType.DM) return;

    const entry = storage.getEntry(message.author.id);
    if (!entry || entry.status !== 'pending') return; // not mid-registration, ignore

    const screenshot = message.attachments.find((a) => (a.contentType || '').startsWith('image/'));
    if (!screenshot) {
      await message.reply("That doesn't look like an image. Send a screenshot of your 2v2 ranked ELO.");
      return;
    }

    const completed = storage.completeEntry(message.author.id, screenshot.url, config.maxSlots);
    if (!completed) return;

    try {
      const guild = await client.guilds.fetch(config.guildId);
      const member = await guild.members.fetch(message.author.id);
      const roleId = completed.status === 'registered' ? config.registeredRoleId : config.standbyRoleId;
      await member.roles.add(roleId);
    } catch (err) {
      console.error(`Could not assign a role to ${message.author.id}:`, err.message);
    }

    await sheets.appendRow(completed);
    await message.reply({ embeds: [confirmationEmbed(completed)] });

    try {
      const guild = await client.guilds.fetch(config.guildId);
      const logChannel = await guild.channels.fetch(config.adminLogChannelId);
      await logChannel.send({ embeds: [adminLogEmbed(completed)] });
    } catch (err) {
      console.error('Could not post to the admin log channel:', err.message);
    }
  },
};
