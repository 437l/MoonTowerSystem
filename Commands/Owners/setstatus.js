const Discord = require('discord.js');
const { owners } = require(`${process.cwd()}/config`);
const db = require('pro.db');

module.exports = {
  name: 'setstatus',
  run: async (client, message) => {
    const Data = db.get(`Allow - Command setgame = [ ${message.guild.id} ]`);
    const allowedRole = message.guild.roles.cache.get(Data);
    const isAuthorAllowed = message.member.roles.cache.has(allowedRole?.id);
    const isOwner = owners.includes(message.author.id);
  
    if (!isAuthorAllowed && message.author.id !== Data && !isOwner) {
      return message.react('❌');
    }
      
    const args = message.content.split(' ').slice(1).join(' ');
    if (!args) return message.reply('**يرجى كتابة الحالة الجديدة.**');
  
    const row = new Discord.MessageActionRow()
      .addComponents(
        new Discord.MessageButton()
          .setCustomId('playing')
          .setLabel('Playing')
          .setStyle('PRIMARY'),
        new Discord.MessageButton()
          .setCustomId('listening')
          .setLabel('Listening')
          .setStyle('PRIMARY'),
        new Discord.MessageButton()
          .setCustomId('streaming')
          .setLabel('Streaming')
          .setStyle('PRIMARY'),
        new Discord.MessageButton()
          .setCustomId('watching')
          .setLabel('Watching')
          .setStyle('PRIMARY'),
        new Discord.MessageButton()
          .setCustomId('cancel')
          .setLabel('Cancel')
          .setStyle('DANGER')
      );
  
    message.reply({
      components: [row],
    });
  
    const filter = (interaction) => interaction.user.id === message.author.id;
    const collector = message.channel.createMessageComponentCollector({ filter, time: 90000 });
  
    collector.on('collect', async (interaction) => {
      if (interaction.customId === 'playing') {
        interaction.reply({
          content: 'تم تغيير الحالة إلى PLAYING',
          ephemeral: true, 
        });
        await db.set(`status_${message.guild.id}`, { name: args, type: 'PLAYING' });
        await client.user.setPresence({ status: 'idle', activities: [{ name: args, type: 'PLAYING' }] });
      } else if (interaction.customId === 'listening') {
        interaction.reply({
          content: 'تم تغيير الحالة إلى LISTENING',
          ephemeral: true, 
        });
        await db.set(`status_${message.guild.id}`, { name: args, type: 'LISTENING' });
        await client.user.setPresence({ status: 'idle', activities: [{ name: args, type: 'LISTENING' }] });
      } else if (interaction.customId === 'streaming') {
        interaction.reply({
          content: 'تم تغيير الحالة إلى STREAMING',
          ephemeral: true, 
        });
        await db.set(`status_${message.guild.id}`, { name: args, type: 'STREAMING', url: 'https://www.twitch.tv/Astra-Service' });
        await client.user.setPresence({ status: 'idle', activities: [{ name: args, type: 'STREAMING', url: 'https://www.twitch.tv/Astra-Service' }] });
      } else if (interaction.customId === 'watching') {
        interaction.reply({
          content: 'تم تغيير الحالة إلى WATCHING',
          ephemeral: true, 
        });
        await db.set(`status_${message.guild.id}`, { name: args, type: 'WATCHING' });
        await client.user.setPresence({ status: 'idle', activities: [{ name: args, type: 'WATCHING' }] });
      } else if (interaction.customId === 'cancel') {
        interaction.reply({
          content: 'تم الإلغاء',
          ephemeral: true,
        });
      }
    });
  }}
  