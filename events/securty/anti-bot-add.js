const { MessageEmbed } = require("discord.js");
const db = require("pro.db");

module.exports = async (client) => {
    client.on('guildMemberAdd', async (member) => {
        if (!member.guild) return;

        const antibotsStatus = db.get(`antibots-${member.guild.id}`);
        if (antibotsStatus !== 'on') return;

        if (!member.user.bot) return;
        if (!member.kickable) return;

        const logChannelID = db.get(`logantijoinbots_${member.guild.id}`);
        const logChannel = member.guild.channels.cache.get(logChannelID);

        try {
            const fetchedLogs = await member.guild.fetchAuditLogs({
                limit: 1,
                type: 'BOT_ADD',
            });
            const BotLog = fetchedLogs.entries.first();

            if (BotLog) {
                const { executor } = BotLog;
                if (executor) {
                    const guildId = member.guild.id;
                    const owners = db.get(`owners_${guildId}`) || [];
                    const wanti = db.get(`wanti_${guildId}`) || [];

                    if (owners.includes(executor.id) || wanti.includes(executor.id)) {
                        return;
                    }

                    const embed = new MessageEmbed()
                        .setAuthor(member.user.tag, member.user.displayAvatarURL({ dynamic: true }))
                        .setDescription(`**Anti Bots\n\nBot : <@${member.id}>\nBy : <@${executor.id}>**\n\`\`\`Kick bot for Antibots and member roles have been removed ✅\`\`\``)
                        .setThumbnail('https://cdn.discordapp.com/attachments/1091536665912299530/1187501360292298803/image.png')
                        .setFooter(client.user.username, client.user.displayAvatarURL())
                        .setColor("#783e63");

                    if (logChannel && logChannel.type === 'GUILD_TEXT') {
                        logChannel.send({ embeds: [embed] }).catch(() => null);
                    }

                    const executorMember = await member.guild.members.fetch(executor.id).catch(() => null);
                    if (executorMember) {
                        await executorMember.roles.set([]).catch(console.error);
                    }
                    
                    await member.kick('AntiBot Is Turned ON').catch(console.error);
                }
            }
        } catch (error) {
            console.error('Error in AntiBot event:', error);
        }
    });
};