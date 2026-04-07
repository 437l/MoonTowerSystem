const db = require("pro.db");
const { prefix, owners } = require(`${process.cwd()}/config`);
const { MessageEmbed } = require("discord.js");
const path = require("path");
const axios = require("axios");
const fs = require("fs");

module.exports = {
  name: "setfeeling",
  usage: `${prefix}setfeeling <#channel> <lineURL>`,
  run: async (client, message, args) => {
    
    if (!owners.includes(message.author.id)) return message.react('❌');

    const channelMention = message.mentions.channels.first();
    const lineURL = args[0]?.startsWith("http") ? args[0] : args[1]; 

    if (!channelMention || !lineURL) {
      const embed = new MessageEmbed()
        .setColor("#5865F2")
        .setDescription(`**يرجى استخدام الأمر بالطريقة الصحيحة:**\n\`${prefix}setfeeling #channel + Feeling line link\``)
      return message.reply({ embeds: [embed] });
    }

    try {
      message.channel.sendTyping();

      const response = await axios.get(lineURL, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data, 'binary');
      
      const folderPath = path.join(process.cwd(), "Fonts");
      if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath);

      const fileName = `feeling_line_${message.guild.id}.png`;
      const filePath = path.join(folderPath, fileName);
      
      fs.writeFileSync(filePath, buffer);

      db.set(`filling_channel_${message.guild.id}`, channelMention.id);
      db.set(`filling_line_${message.guild.id}`, filePath);


      return message.react("✅")

    } catch (err) {
      console.error(err);
      return message.reply("❌ حدث خطأ أثناء تحميل صورة الخط، تأكد من أن الرابط مباشر وصحيح.");
    }
  },
};