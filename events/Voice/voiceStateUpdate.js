const db = require("pro.db");
const humanizeDuration = require('humanize-duration');
const Discord = require('discord.js');
const fs = require("fs");
const config = require(`${process.cwd()}/config`);
const temp = config.temp;
module.exports = async (client, oldState, newState) => {
    if (!fs.existsSync('temp_channels.json')) {
        fs.writeFileSync('temp_channels.json', JSON.stringify({}, null, 2));
    }

    const guildId = oldState.guild.id;
    let logvjoinvexit = db.get(`logvjoinvexit_${guildId}`);
    let logmove = db.get(`logmove_${guildId}`);
    
    let logChannelJoinExit = oldState.guild.channels.cache.get(logvjoinvexit);
    let logChannelMove = oldState.guild.channels.cache.get(logmove);
    
    if (oldState.member.bot || newState.member.bot) return;

    // ------------------------------ Voice Logs (Join/Exit) ------------------------------
    if (logChannelJoinExit) {
  
        if (!oldState.channelId && newState.channelId) {
            let members = newState.channel && newState.channel.members.size > 0 
                ? newState.channel.members.map(member => `${member.displayName}`).join('\n ') 
                : 'لا يوجد ❌';
            
            let embed = new Discord.MessageEmbed()
                .setAuthor(newState.member.displayName, newState.member.user.displayAvatarURL({ dynamic: true }))
                .setDescription(`**انضم إلى القناة**\n\n**مستخدم : <@${oldState.member.user.id}>**\n**فيـ : <#${newState.channel.id}>**\n\`\`\`الاعضاء 🙆‍♀️ :\n ${members}\`\`\``)
                .setColor(`#91beb4`)
                .setFooter(client.user.username, client.user.displayAvatarURL())
                .setThumbnail(`https://cdn.discordapp.com/attachments/1091536665912299530/1224546888003616799/8B73770E-31D7-489A-8BF6-152D91D6D76A.png`);
            
            logChannelJoinExit.send({ embeds: [embed] }).catch(() => {});
        } 
        else if (oldState.channelId && !newState.channelId) {
            let members = oldState.channel && oldState.channel.members.size > 0 
                ? oldState.channel.members.map(member => `${member.displayName}`).join('\n ') 
                : 'لا يوجد ❌';
            
            let embed = new Discord.MessageEmbed()
                .setAuthor(oldState.member.displayName, oldState.member.user.displayAvatarURL({ dynamic: true }))
                .setDescription(`**الخروج من القناة**\n\n**مستخدم : <@${oldState.member.user.id}>**\n**من : <#${oldState.channel.id}>**\n\`\`\`الاعضاء 🙆‍♀️ :\n ${members}\`\`\``)
                .setColor(`#91beb4`)
                .setFooter(client.user.username, client.user.displayAvatarURL())
                .setThumbnail(`https://cdn.discordapp.com/attachments/1091536665912299530/1224546888280309931/IMG_2593.png`);
            
            logChannelJoinExit.send({ embeds: [embed] }).catch(() => {});
        }
    }

    // ------------------------------ Voice Logs (Move) ------------------------------
    if (logChannelMove && oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
        let oldChannel = oldState.guild.channels.cache.get(oldState.channelId);
        let newChannel = newState.guild.channels.cache.get(newState.channelId);
        
        let embed = new Discord.MessageEmbed()
            .setAuthor(oldState.member.displayName, oldState.member.user.displayAvatarURL({ dynamic: true }))
            .setDescription(`**نقل بين القنوات الصوتية**\n\n**مستخدم : <@${oldState.member.user.id}>**\n**من : <#${oldChannel.id}>**\n**إلى : <#${newChannel.id}>**`)
            .setColor(`#712519`)
            .setFooter(client.user.username, client.user.displayAvatarURL())
            .setThumbnail(`https://cdn.discordapp.com/attachments/1091536665912299530/1208820125478821948/position.png`);
        
        logChannelMove.send({ embeds: [embed] }).catch(() => {});
    }

   // ---------------- CREATE TEMP CHANNEL ----------------
  if (
    newState.channelId &&
    newState.channelId === temp.channelVoiceId
  ) {

    newState.guild.channels.create(newState.member.user.username, {
      type: "GUILD_VOICE",
      parent: temp.categoryId,
      permissionOverwrites: [
        {
          id: newState.member.id,
          allow: ["CONNECT", "VIEW_CHANNEL", "MANAGE_CHANNELS"],
        },
        {
          id: newState.guild.id,
          deny: ["CONNECT"],
          allow: ["VIEW_CHANNEL"],
        },
      ],
      reason: "Temp channel Bot",
    }).then(async (channeltemp) => {

      await newState.member.voice.setChannel(channeltemp).catch(() => {});

      let temp_channels = {};

      try {
        if (fs.existsSync("temp_channels.json")) {
          const raw = fs.readFileSync("temp_channels.json", "utf-8");
          temp_channels = raw ? JSON.parse(raw) : {};
        }
      } catch {
        temp_channels = {};
      }

      temp_channels[channeltemp.id] = newState.member.id;

      fs.writeFileSync(
        "temp_channels.json",
        JSON.stringify(temp_channels, null, 2)
      );

    }).catch(console.error);
  }


  // ---------------- DELETE TEMP CHANNEL ----------------
  if (oldState.channelId) {

    try {
      if (!fs.existsSync("temp_channels.json")) return;

      const raw = fs.readFileSync("temp_channels.json", "utf-8");
      let temp_channels = raw ? JSON.parse(raw) : {};

      const channel = oldState.channel;
      if (!channel) return;

      const isTemp = temp_channels[oldState.channelId];

      if (
        isTemp &&
        oldState.channelId !== temp.channelVoiceId
      ) {

        const members = channel.members.filter(m => !m.user.bot).size;

        if (members === 0) {

          await channel.delete().catch(() => {});

          delete temp_channels[oldState.channelId];

          fs.writeFileSync(
            "temp_channels.json",
            JSON.stringify(temp_channels, null, 2)
          );
        }
      }

    } catch (error) {
      console.error("Temp system error:", error);
    }
  }
};