const db = require("pro.db");
const { prefix, owners } = require(`${process.cwd()}/config`);

module.exports = {
  name: "n-wlc",
  usage: `${prefix}n-wlc <#channel> <message>`,
  run: async (client, message, args) => {
    if (!message.member.permissions.has("ADMINISTRATOR") && !owners.includes(message.author.id)) return message.react('❌');

    const channel = message.mentions.channels.first();
    const welcomeMsg = args.slice(1).join(" ");

    if (!channel || !welcomeMsg) {
      return message.reply(`**يرجى استعمال الأمر بالطريقة الصحيحة .**\n\`${prefix}wlc <#channel> <الرسالة>\`\n\n**المتغيرات المتاحة:**\n\n\`[user]\` : منشن للعضو\n\`[inviter]\` : منشن للداعي\n\`[servername]\` : يذكر اسم السيرفر\n\`[membercount]\` : يذكر عدد أعضاء السيرفر`);
    }


    db.set(`welcome_channel_${message.guild.id}`, channel.id);
    db.set(`welcome_msg_${message.guild.id}`, welcomeMsg);

    message.reply(`✅ ${channel}\n **الرسالة:** ${welcomeMsg}`);
  }
};