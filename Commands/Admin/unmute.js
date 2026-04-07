const { MessageEmbed } = require("discord.js");
const moment = require('moment');
const Data = require('pro.db');
const { prefix, owners } = require(`${process.cwd()}/config`);

module.exports = {
  name: 'unmute',
  aliases: ['تكلم'],
  run: async (client, message, args) => {
    const isEnabled = Data.get(`command_enabled_${module.exports.name}`);
    if (isEnabled === false) {
      return; 
    }

    const Color = Data.get(`Guild_Color = ${message.guild.id}`) || '#4e464f';
    if (!Color) return;

    const allowedRole = message.guild.roles.cache.get(Data.get(`Allow - Command mute = [ ${message.guild.id} ]`));
    const isAuthorAllowed = message.member.roles.cache.has(allowedRole?.id);

    if (!isAuthorAllowed && message.author.id !== allowedRole && !message.member.permissions.has('MUTE_MEMBERS')) {
      return;
    }

    let member;
    if (message.mentions.members.size > 0) {
      member = message.mentions.members.first();
    } else {
      const memberId = args[0];
      member = message.guild.members.cache.get(memberId);
    }

    if (!member) {
      const embed = new MessageEmbed()
        .setColor(`${Color || `#4e464f`}`)
        .setDescription(`**يرجى استعمال الأمر بالطريقة الصحيحة .\n${prefix}تكلم <@${message.author.id}>**`);
      return message.reply({ embeds: [embed] });
    }

    let role = member.guild.roles.cache.find((role) => role.name === 'Muted');
    if (!role) {
      return message.react('❎');
    }

    member.roles.remove(role)
      .then(() => {
        message.react('✅');
      })
      .catch((error) => {
        console.error(error);
        console.log('An error occurred while unmuting the member.');
      });

    const prisonData = Data.get(`Muted_Member_${member.id}`);
    const prisonReason = prisonData ? prisonData.reason : "سبب الاسكات غير معروف";

    let logChannel = Data.get(`logtmuteuntmute_${message.guild.id}`);

    logChannel = message.guild.channels.cache.find(channel => channel.id === logChannel);

    if (logChannel) {
      const logEmbed = new MessageEmbed()
        .setAuthor(member.user.tag, member.user.displayAvatarURL({ dynamic: true }))
        .setColor('#312e5d')
        .setDescription(`**فك الآسكات الكتابي\n\nالعضو : ${member}\nبواسطة : ${message.author}\n[Message](${message.url})\nفّك فيـ : \`${moment().format('HH:mm')}\`**\n\`\`\`Mute : ${prisonReason}\`\`\` `)       
        .setThumbnail(`https://cdn.discordapp.com/attachments/1091536665912299530/1153875266066710598/image_1.png`)
        .setFooter(`${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true }));
      logChannel.send({ embeds: [logEmbed] });
    }

    if (Data.has(`Muted_Member_${member.id}`)) {
      await Data.delete(`Muted_Member_${member.id}`);
    } else {
      console.log('No data found to delete.');
    }
  },
};
