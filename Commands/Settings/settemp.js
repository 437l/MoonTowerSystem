const { MessageActionRow, MessageButton, MessageSelectMenu } = require("discord.js");
const config = require(`${process.cwd()}/config`);
const temp = config.temp;

module.exports = {
  name: "settemp",
  run: async (client, message, args) => {
    if (message.author.bot || !message.guild) return;

    if (!message.member.permissions.has("ADMINISTRATOR")) {
      return message.reply("ليس لديك الإذن لاستخدام هذا الأمر ❌");
    }

    const embeds = [
      {
        author: {
          name: "Temp Channel Dashboard",
          icon_url: message.guild.iconURL({ dynamic: true }),
        },
        description: `قم بالضغط على الأزرار تحت للتحكم بالروم الصوتي الخاص بك`,
        image: {
          url: `https://media.discordapp.net/attachments/1311758507858727003/1317141747310137404/snapedit_1734100691609_1_1_1_1.png`,
        },
        color: temp.color,
      },
    ];

    const selectMenuOptions = temp.voiceLimits.map((num) => ({
      label: num == 0 ? "No Limit" : `${num}`,
      value: `${num}`,
    }));

    const row1 = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId(`temp_public_${Date.now()}`)
        .setStyle("SECONDARY")
        .setLabel('\u200b')
        .setEmoji(temp.emojis.public),
      new MessageButton()
        .setCustomId(`temp_private_${Date.now()}`)
        .setStyle("SECONDARY")
        .setLabel('\u200b')
        .setEmoji(temp.emojis.private),
      new MessageButton()
        .setCustomId(`temp_unmute_${Date.now()}`)
        .setStyle("SECONDARY")
        .setLabel('\u200b')
        .setEmoji(temp.emojis.unmute),
      new MessageButton()
        .setCustomId(`temp_mute_${Date.now()}`)
        .setStyle("SECONDARY")
        .setLabel('\u200b')
        .setEmoji(temp.emojis.mute),
      new MessageButton()
        .setCustomId(`temp_rename_${Date.now()}`)
        .setStyle("SECONDARY")
        .setLabel('\u200b')
        .setEmoji(temp.emojis.rename)
    );

    const row2 = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId(`temp_disconnect_${Date.now()}`)
        .setStyle("DANGER")
        .setLabel('\u200b')
        .setEmoji(temp.emojis.disconnect),
      new MessageButton()
        .setCustomId(`temp_hide_${Date.now()}`)
        .setStyle("PRIMARY")
        .setLabel('\u200b')
        .setEmoji(temp.emojis.hide),
      new MessageButton()
        .setCustomId(`temp_unhide_${Date.now()}`)
        .setStyle("PRIMARY")
        .setLabel('\u200b')
        .setEmoji(temp.emojis.unhide),
      new MessageButton()
        .setCustomId(`temp_kickuser_${Date.now()}`)
        .setStyle("PRIMARY")
        .setLabel('\u200b')
        .setEmoji(temp.emojis.kickuser) 
    );

    const row3 = new MessageActionRow().addComponents(
      new MessageSelectMenu()
        .setCustomId("temp_limit_" + Date.now())
        .setPlaceholder("عدد الاعضاء الذين يمكنهم الدخول")
        .setMaxValues(1)
        .setMinValues(1)
        .addOptions(selectMenuOptions)
    );

    message.channel
      .send({ embeds, components: [row1, row2, row3] })
      .then(() => {
        message.delete().catch(() => {});
      })
      .catch(console.error);
  },
};