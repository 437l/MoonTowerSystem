const { Client, Collection, MessageAttachment, WebhookClient, Intents, MessageButton, MessageSelectMenu, MessageActionRow, MessageModal, Role, Modal, TextInputComponent, MessageEmbed } = require("discord.js");
const { owners, prefix } = require(`${process.cwd()}/config`);
const db = require(`pro.db`);

module.exports = {
  name: "setticket",
  description: "A simple ping command.",
  run: async (client, message) => {
    if (!owners.includes(message.author.id)) return message.react('❌');
    const isEnabled = db.get(`command_enabled_${module.exports.name}`);
    if (isEnabled === false) return;

    const Color = db.get(`Guild_Color = ${message.guild?.id}`) || `#4e464f`;
    const Image = db.get(`Image = [${message.guild.id}]`);
    const Channel = db.get(`Channel = [${message.guild.id}]`);
    const Role = db.get(`Role = [${message.guild.id}]`);
    const Cat = db.get(`Cat = [${message.guild.id}]`);

    if (!Cat || !Role || !Channel || !Image) {
      let missingItems = [];
      if (!Cat) missingItems.push(`\`#1\` ${prefix}tcopen : تعيين الكاتاقوري`);
      if (!Role) missingItems.push(`\`#2\` ${prefix}tcrole : اضافة رولات التذكرة`);
      if (!Channel) missingItems.push(`\`#3\` ${prefix}ticlog : تعين شات لوج التذكرة`);
      if (!Image) missingItems.push(`\`#4\` ${prefix}ticimage : تعيين صورة التذكرة`);

      const missingEmbed = new MessageEmbed()
        .setColor(Color)
        .setDescription(`**يرجى تنصيب باقي الأوامر:**\n${missingItems.join('\n')}.`);

      return message.reply({ embeds: [missingEmbed] });
    }

    if (message.author.bot || !message.guild) return;

    const menuOptions = [
      { label: 'الاستفسارات', description: 'الخيار المناسب للاستفسار عن شيء ما.', emoji: '<a:2_3:1312792731524927558>', value: 'M1' },
      { label: 'تقديم الادارة', description: 'الخيار المناسب للتقديم على الادارة.', emoji: '<a:2_4:1312792781445402716>', value: 'M2' },
      { label: 'استلام الهدايا', description: 'الخيار المناسب لاستلام هدايا الفعاليات.', emoji:  '<a:2_10:1312801780760969288>', value: 'M3' },
    ];

    db.set(`menuOptions_${message.guild.id}`, menuOptions);

    const Emb = new MessageActionRow().addComponents(
      new MessageSelectMenu()
        .setCustomId(`M0`)
        .setOptions(menuOptions)
        .setPlaceholder("الرجاء الضغط هنا واختيار التذكرة المناسبة.")
    );

    const args = message.content.split(' ').slice(1);
    const userMessage = args.length > 0 ? args.join(" ") : null;

    if (userMessage) {
      const embed = new MessageEmbed()
        .setDescription(userMessage)
        .setColor(Color)
        .setImage(Image);

      message.channel.send({ embeds: [embed], components: [Emb] }).then(async () => {
        await message.delete().catch(() => {});
      });
    } else {
      message.channel.send({ files: [Image], components: [Emb] }).then(async () => {
        await message.delete().catch(() => {});
      });
    }
  },
};