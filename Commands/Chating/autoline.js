const db = require("pro.db");
const { prefix, owners } = require(`${process.cwd()}/config`);
const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "autoline",
  description: "To set font URL and channel",
  usage: `${prefix}autoline <fontURL> <#channel>`,
  run: async (client, message, args) => {
    if (!owners.includes(message.author.id)) return message.react('❌');
    
    const isEnabled = db.get(`command_enabled_${module.exports.name}`);
    if (isEnabled === false) return;

    const Color = db.get(`Guild_Color_${message.guild.id}`) || '#4e464f';

    if (args.length % 2 !== 0 || args.length === 0) {
      const embed = new MessageEmbed()
        .setColor(Color)
        .setDescription(`**يرجى استعمال الأمر بالطريقة الصحيحة .**\n\`${prefix}autoline <fontURL> <#channel>\``);
      return message.reply({ embeds: [embed] });
    }

    let storedChannels = db.get("Channels") || [];

    for (let i = 0; i < args.length; i += 2) {
      const fontURL = args[i]; 
      const channelID = args[i + 1].replace(/[^0-9]/g, ''); 

      const channel = message.guild.channels.cache.get(channelID);
      if (!channel || channel.type !== 'GUILD_TEXT') continue;

      const existingIndex = storedChannels.findIndex(c => c.channelID === channelID);
      
      const channelData = { 
          "channelID": channelID, 
          "fontURL": fontURL 
      };

      if (existingIndex !== -1) {
        storedChannels[existingIndex] = channelData;
      } else {
        storedChannels.push(channelData);
      }
    }
    db.set("Channels", storedChannels);
    message.react(`✅`);
  },
};