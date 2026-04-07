const {  MessageEmbed } = require("discord.js");
const { prefix, owners } = require(`${process.cwd()}/config`);
const Pro = require(`pro.db`);
const moment = require('moment');
const Data = require('pro.db');

module.exports = {
  name: 'unprison',
  aliases: ['عفو',"فك"],
  run: async (client, message, args) => {

    const isEnabled = Data.get(`command_enabled_${module.exports.name}`);
    if (isEnabled === false) {
        return; 
    }

    
    const Color = Pro.get(`Guild_Color = ${message.guild.id}`) || '#4e464f';
    if (!Color) return;

    const db = Pro.get(`Allow - Command unprison = [ ${message.guild.id} ]`)
    const allowedRole = message.guild.roles.cache.get(db);
    const isAuthorAllowed = message.member.roles.cache.has(allowedRole?.id);

    if (!isAuthorAllowed && message.author.id !== db  && !message.member.permissions.has('MUTE_MEMBERS')) {
        // إجراءات للتصرف عندما لا يتحقق الشرط
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
      .setDescription(`**يرجى استعمال الأمر بالطريقة الصحيحة .\n${prefix}عفو <@${message.author.id}>**`);
      return message.reply({ embeds: [embed] });
    }

    let role = member.guild.roles.cache.find((role) => role.name === 'prison');
    if (!role || !Pro.get(`MutedMember_${member.id}`)) {
      // إذا لم يكن العضو مسجونًا، أرسل رسالة توضح ذلك
      return message.reply(`**${member} ليس مسجونًا!**`);
    }

    const prisonData = Pro.get(`MutedMember_${member.id}`);
    const prisonReason = prisonData ? prisonData.reason : "سبب السجن غير معروف";

    member.roles.remove(role)
      .then(() => {
        message.react('✅');

        let logChannel = Data.get(`logprisonunprison_${message.guild.id}`);
        logChannel = message.guild.channels.cache.find(channel => channel.id === logChannel);

        if (logChannel) {
            const logEmbed = new MessageEmbed()
            .setAuthor(member.user.tag, member.user.displayAvatarURL({ dynamic: true }))

                .setColor('#707487')
                .setDescription(`**فك سجن\n\nالعضو : ${member}\nبواسطة : ${message.author}\n[Message](${message.url})\nفّك فيـ : \`${moment().format('HH:mm')}\`**\n\`\`\`Prison : ${prisonReason}\`\`\` `)       
                .setThumbnail('https://cdn.discordapp.com/attachments/1091536665912299530/1224588302393540638/bars.png?ex=661e09bb&is=660b94bb&hm=198f684aacf261c80430479f57f365b8c3dd11aa914b5c382240a2adbe33b00a&')
                .setFooter({ text: `${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) });
            logChannel.send({ embeds: [logEmbed] });
        }


        // حذف معلومات السجن من قاعدة البيانات
        Pro.delete(`MutedMember_${member.id}`);
      })
      .catch((error) => {
        console.error(error);
        console.log('An error occurred while unmuting the member.');
      });

    
  },
};
