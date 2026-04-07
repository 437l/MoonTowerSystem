const { MessageEmbed } = require("discord.js");
const fs = require("fs");
const { prefix } = require(`${process.cwd()}/config`);

module.exports = {
  name: "tempcreate",

  run: async (client, message, args) => {
    if (message.author.bot || !message.guild) return;

    if (!message.member.permissions.has("ADMINISTRATOR")) return message.react("❌");

    let voiceChannel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
    let category = message.guild.channels.cache.get(args[1]) || message.guild.channels.cache.find(c => c.name === args.slice(1).join(" ") && c.type === 'GUILD_CATEGORY');

    if (!voiceChannel || !args[1]) {
      const embed = new MessageEmbed()
        .setColor(`#4e464f`)
        .setDescription(
          `**يرجى استعمال الأمر بالطريقة الصحيحة.\n${prefix}tempcreate <#VoiceChannel/ID> <CategoryID/Name>**`
        );

      return message.reply({ embeds: [embed] });
    }

    const newVoice = voiceChannel.id;
    const newCategory = category.id;

    try {
      const configPath = `${process.cwd()}/config.json`;
      const data = JSON.parse(fs.readFileSync(configPath, "utf8"));

      data.temp.channelVoiceId = newVoice;
      data.temp.categoryId = newCategory;

      fs.writeFileSync(configPath, JSON.stringify(data, null, 4));

      return message.react("✅");
    } catch (err) {
      console.error(err);
      return message.react("❌");
    }
  },
};