const { MessageActionRow, MessageSelectMenu, MessageEmbed } = require("discord.js");

const { prefix, owners } = require(`${process.cwd()}/config`);

const Pro = require(`pro.db`);

module.exports = {

  name: "unban",

  aliases: ["unban"],

  description: "فك الحظر عن عضو",

  usage: ["!unban @user"],

  run: async (client, message, args, config) => {

    const isEnabled = Pro.get(`command_enabled_${module.exports.name}`);

    if (isEnabled === false) {

        return; 

    }

    const Color = Pro.get(`Guild_Color = ${message.guild.id}`) || '#4e464f';

    if (!Color) return;

    const db = Pro.get(`Allow - Command ban = [ ${message.guild.id} ]`)

    const allowedRole = message.guild.roles.cache.get(db);

    const isAuthorAllowed = message.member.roles.cache.has(allowedRole?.id);

    if (!isAuthorAllowed && message.author.id !== db  && !message.member.permissions.has('ADMINISTRATOR')) {

      return;

    }

    if (!message.guild.members.me.permissions.has("BAN_MEMBERS")) {

      return message.reply({

        content: "🙄 **لا يمكنني فك الحظر لهذا العضو. يرجى التحقق من صلاحياتي وموقع دوري.**",

        allowedMentions: { parse: [] },

        ephemeral: true,

      });

    }

    const userArg = args.join(" ");

    if (!userArg) {

      const embed = new MessageEmbed()

        .setColor(`${Color || `#4e464f`}`)

        .setDescription(`**يرجى استعمال الأمر بالطريقة الصحيحة .\n${prefix}unban <@${message.author.id}>**`);

      return message.reply({ embeds: [embed] });

    }

    let userID = userArg.match(/\d+/)?.[0];

    let bannedUser;

    try {

      const bans = await message.guild.bans.fetch();

      if (userID) {

        bannedUser = bans.get(userID);

      }

      if (!bannedUser) {

        bannedUser = bans.find(

          (ban) =>

            ban.user.username.toLowerCase() === userArg.toLowerCase() ||

            ban.user.tag.toLowerCase() === userArg.toLowerCase()

        );

      }

      if (!bannedUser) {

        return message.reply({

          content: "🙄 **لم يتم العثور على العضو المحدد في قائمة المحظورين**",

          allowedMentions: { parse: [] },

          ephemeral: true,

        });

      }

      await message.guild.members.unban(bannedUser.user.id);

      const embed = new MessageEmbed()

        .setDescription(`**تم فك حظره بنجاح** <@${bannedUser.user.id}> ✅`)

        .setColor(`${Color || `#4e464f`}`);

      message.reply({ embeds: [embed], allowedMentions: { parse: [] } });

      const logbanunban = Pro.get(`logbanunban_${message.guild.id}`);

      const logChannel = message.guild.channels.cache.get(logbanunban);

      if (!logChannel) return;

      const executor = message.author;

      const logEmbed = new MessageEmbed()

        .setAuthor(executor.tag, executor.displayAvatarURL({ dynamic: true }))

        .setDescription(`**تم فك حظر العضو**\n\n**لـ : <@${bannedUser.user.id}>**\n**بواسطة : ${executor}**\n\`\`\`Reason : No reason\`\`\`\ `)

        .setColor(`#880013`)

        .setThumbnail('https://cdn.discordapp.com/attachments/1091536665912299530/1209554198660784138/551F8C85-8827-41AF-9286-256F63BE21294.png')

        .setFooter(message.guild.name, message.guild.iconURL({ dynamic: true }));

      logChannel.send({ embeds: [logEmbed] });

    } catch (error) {

      console.error(`Failed to unban user: ${error}`);

      message.reply({

        content: "🙄 **حدث خطأ أثناء محاولة إزالة الحظر عن العضو المحدد**",

        allowedMentions: { parse: [] },

        ephemeral: true,

      });

    }

  },

};