const { Message, Client } = require("discord.js");
const { MessageActionRow, MessageSelectMenu, MessageEmbed } = require("discord.js");
const { prefix, owners } = require(`${process.cwd()}/config`);
const Pro = require(`pro.db`);
module.exports = {
  name: "vunmute",
  aliases: ["فك","unvmute"],
  description: "unmute a member from the voice channel",
  usage: ["!vunmute @user"],
  run: async (client, message, args, config) => {

        const isEnabled = Pro.get(`command_enabled_${module.exports.name}`);
        if (isEnabled === false) {
            return; 
        }
    

        const Color = Pro.get(`Guild_Color = ${message.guild.id}`) || '#4e464f';
        if (!Color) return;

        const db = Pro.get(`Allow - Command vmute = [ ${message.guild.id} ]`)
const allowedRole = message.guild.roles.cache.get(db);
const isAuthorAllowed = message.member.roles.cache.has(allowedRole?.id);

if (!isAuthorAllowed && message.author.id !== db  && !message.member.permissions.has('BAN_MEMBERS')) {
    // إجراءات للتصرف عندما لا يتحقق الشرط
    return;
}



    
const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
                if (!args[0]) {
                        const embed = new MessageEmbed()
                        .setColor(`${Color || `#4e464f`}`)
                        .setDescription(`**يرجى استعمال الأمر بالطريقة الصحيحة .\n${prefix}فك <@${message.author.id}>**`);
                        return message.reply({ embeds: [embed] });
                      }

                if (!member) return message.reply({ content: `**لا يمكنك فك الميوت لهاذا العضو .**` }).catch((err) => {
                        console.log(`**لم أتمكن من الرد على الرسالة:**` + err.message)
                })

                if (message.member.roles.highest.position < member.roles.highest.position) return message.reply({ content: `:rolling_eyes: **${member.user.username} have higher role than you**` }).catch((err) => {
                        console.log(`**لم أتمكن من الرد على الرسالة:**` + err.message)
                })


              
                if (!member.voice.channel) return message.reply({ content: `**المستخدم ليس في قناة صوتية .**` })
                member.voice.setMute(false).then(() => {
                        message.reply({ content: `**✅ تم فك الاسكات عن ${member.user.username}**` })
                })

        },
};