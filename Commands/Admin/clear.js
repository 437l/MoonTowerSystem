const Pro = require('pro.db');
const { owners, config } = require(`${process.cwd()}/config`);
const { MessageEmbed } = require("discord.js");

module.exports = {
  name: 'clear',
  aliases: ['مسح'],
  run: async (client, message, args) => {

    const isEnabled = Pro.get(`command_enabled_${module.exports.name}`);
    if (isEnabled === false) return;

    const dbAllowed = Pro.get(`Allow - Command clear = [ ${message.guild.id} ]`);
    const allowedRole = message.guild.roles.cache.get(dbAllowed);
    const isAuthorAllowed = message.member.roles.cache.has(allowedRole?.id);

    if (
      !isAuthorAllowed &&
      message.author.id !== dbAllowed &&
      !message.member.permissions.has('MANAGE_MESSAGES') &&
      !message.member.roles.cache.has(config?.owners)
    ) {
      return message.react('❌');
    }

    if (!message.guild.members.me.permissions.has('MANAGE_MESSAGES')) {
      return message.reply("I don't have permission `MANAGE_MESSAGES`.");
    }

    const convertArabicNumbers = str => str.replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
    let rawArgs = args.join(' ');
    let normalizedArgs = convertArabicNumbers(rawArgs);
    let messageCount = parseInt(normalizedArgs) || 100; 

    if (messageCount > 100) messageCount = 100;

    const mentionedUser = message.mentions.users.first();
    const deleteNotify = await message.reply("Deleting Messages...");

    setTimeout(() => message.delete().catch(() => {}), 1000);

    try {
      let fetchedMessages = await message.channel.messages.fetch({ limit: 100 });
      let messagesToDelete;

      if (mentionedUser) {
        messagesToDelete = fetchedMessages.filter(
          msg => msg.author.id === mentionedUser.id && msg.id !== deleteNotify.id
        ).first(messageCount);
      } else {
        messagesToDelete = fetchedMessages.filter(
          msg => msg.id !== deleteNotify.id && msg.id !== message.id
        ).first(messageCount);
      }

      if (!messagesToDelete || messagesToDelete.length === 0) {
        return deleteNotify.edit("لا توجد رسائل صالحة للحذف (قد تكون قديمة جداً أو الشات فارغ بلفعل).");
      }

      const deleted = await message.channel.bulkDelete(messagesToDelete, true);
      
      const logChannelId = Pro.get(`channelmessage_${message.guild.id}`);
      const logChannel = message.guild.channels.cache.get(logChannelId);

      if (logChannel) {
        let logContent = deleted.map(msg => `${msg.author.tag}: ${msg.content || "[صورة/ملف]"}`).join('\n');
        if (logContent.length > 0) {
          logChannel.send({
            content: `**تم مسح رسائل في قناة:** ${message.channel}\n**بواسطة:** ${message.author.tag}\n**العدد:** ${deleted.size}`,
            files: [{
              attachment: Buffer.from(logContent),
              name: 'deleted_messages.txt'
            }]
          }).catch(() => {});
        }
      }

      await deleteNotify.edit(`\`\`\`javascript
✅ تم مسح ${deleted.size} رسالة بنجاح.
${mentionedUser ? `العضو : ${mentionedUser.username}` : ''}\`\`\``);

      setTimeout(() => deleteNotify.delete().catch(() => {}), 3000);

    } catch (err) {
      console.error(err);
    }
  }
};