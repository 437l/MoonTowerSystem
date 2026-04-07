const db = require("pro.db");
const Discord = require('discord.js');

module.exports = async (client, member) => {
    const { guild } = member;

    const sendWelcome = async (inviter = null) => {
        const welcomeChannelId = db.get(`welcome_channel_${guild.id}`);
        const welcomeRawMsg = db.get(`welcome_msg_${guild.id}`);

        if (welcomeChannelId && welcomeRawMsg) {
            const welcomeChannel = guild.channels.cache.get(welcomeChannelId);
            if (welcomeChannel) {
                let welcomeFinalMsg = welcomeRawMsg
                    .replace(/\[user\]/g, `<@${member.id}>`)
                    .replace(/\[inviter\]/g, inviter ? inviter.username : `<@${guild.ownerId}>`)
                    .replace(/\[servername\]/g, guild.name)
                    .replace(/\[membercount\]/g, guild.memberCount);
                
                welcomeChannel.send({ content: welcomeFinalMsg }).catch(() => {});
            }
        }

        const logJoinLeave = db.get(`logjoinleave_${guild.id}`);
        const logChannel = guild.channels.cache.get(logJoinLeave);
      
        if (logChannel) {
            let devices = "Unknown";
            if (member.presence?.clientStatus) {
                const cs = member.presence.clientStatus;
                if (cs.web) devices = "🌐 متصفح";
                else if (cs.desktop) devices = "💻 كمبيوتر";
                else if (cs.mobile) devices = "📱 جوال";
            }

            let inviterEmbed = new Discord.MessageEmbed()
                .setAuthor(member.user.username, member.user.displayAvatarURL({ dynamic: true }))
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                .setColor('#637a70')
                .setDescription(`**انضمام العضو**\n\n**العضو : <@${member.id}>**\n**بواسطة : ${inviter ? inviter.tag : `<@${guild.ownerId}>`}**\n**انضم فيـ : <t:${Math.floor(member.joinedAt.getTime() / 1000)}:R>**\n**الأجهزة : ${devices}**\n**عدد الأعضاء : ${guild.memberCount}**`)
                .setFooter(inviter ? inviter.username : 'Owner', inviter ? inviter.displayAvatarURL({ dynamic: true }) : guild.iconURL());

            logChannel.send({ embeds: [inviterEmbed] }).catch(() => {});
        }
    };

    if (client.tracker) {
        client.tracker.on("memberAdd", async (m, inviter) => {
            if (m.id !== member.id) return; 
            await sendWelcome(inviter);
        });
    } else {
        await sendWelcome();
    }
};