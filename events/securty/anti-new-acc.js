const moment = require('moment');
const { MessageEmbed } = require('discord.js');
const db = require("pro.db");

module.exports = async (client) => {
    client.on('guildMemberAdd', async (member) => {
        if (!member.guild || member.user.bot) return;

        const antijoinEnabled = db.get(`antijoin_status_${member.guild.id}`);
        const punishment = db.get(`antijoinPunishment_${member.guild.id}`);
        const logChannelID = db.get(`logprisonunprison_${member.guild.id}`);

        if (antijoinEnabled === false) return;

        const accountCreated = member.user.createdAt;
        const thirtyDaysAgo = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000));

        if (accountCreated > thirtyDaysAgo) {
            let embed = new MessageEmbed()
                .setColor('#4e464f')
                .setThumbnail("https://cdn.discordapp.com/attachments/1091536665912299530/1223032566773186701/release.png")
                .setFooter(client.user.username, client.user.displayAvatarURL());

            let action = "";

            if (punishment === 'kick') {
                action = 'kick';
                embed.setTitle('Kick warning')
                    .setDescription('**Hello, your account is detected as new, and as a result, you have been kicked.**');
                
                await member.send({ embeds: [embed] }).catch(() => null);
                await member.kick('New account detected').catch(console.error);

            } else if (punishment === 'ban') {
                action = 'ban';
                embed.setTitle('Ban warning')
                    .setDescription('**Hello, your account is detected as new, and as a result, you have been banned.**');
                
                await member.send({ embeds: [embed] }).catch(() => null);
                await member.ban({ reason: 'New account detected' }).catch(console.error);

            } else if (punishment === 'prison') {
                action = 'prison';
                embed.setTitle('prison warning')
                    .setDescription('**Hello, your account is detected as new, and as a result, you have been jailed.**');
                
                const jailRole = member.guild.roles.cache.find(role => role.name === 'prison');
                if (jailRole) {
                    await member.roles.add(jailRole).catch(console.error);
                    await member.send({ embeds: [embed] }).catch(() => null);
                } else {
                    return console.error('The role "prison" does not exist in the server');
                }
            } else {
                return;
            }

            const logChannel = member.guild.channels.cache.get(logChannelID);
            if (logChannel && logChannel.type === 'GUILD_TEXT') {
                const logEmbed = new MessageEmbed()
                    .setAuthor(member.user.username, member.user.displayAvatarURL({ dynamic: true }))
                    .setColor('#70928c')
                    .setDescription(`**Anti Join ${action.charAt(0).toUpperCase() + action.slice(1)}\n\nTo: ${member}\nBy: ${client.user}\nAction: \`${action}\`\nTime: \`${moment().format('HH:mm')}\`**\n\`\`\`Reason: New Account Detected\`\`\``)
                    .setThumbnail('https://cdn.discordapp.com/attachments/1091536665912299530/1223114187690086420/secure.png')
                    .setFooter(member.guild.name, member.guild.iconURL({ dynamic: true }));
                
                logChannel.send({ embeds: [logEmbed] }).catch(() => null);
            }
        }
    });
};