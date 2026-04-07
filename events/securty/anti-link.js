const { MessageEmbed } = require("discord.js");
const db = require("pro.db");

module.exports = async (client) => {
    client.on('messageCreate', async (message) => {
        if (!message.guild || message.author.bot) return;

        const guildId = message.guild.id;
        const owners = db.get(`owners_${guildId}`) || [];
        if (owners.includes(message.author.id)) return;

        const wanti = db.get(`wanti_${guildId}`);
        if (wanti && wanti.includes(message.author.id)) return;

        const antiLinksEnabled = db.get(`antilinks-${guildId}`);
        if (antiLinksEnabled !== 'on') return;

        const discordInviteRegex = /(https?:\/\/)?discord\.(gg|io|me|li)\/[\w-]{2,}/i;
        const containsDiscordInvite = discordInviteRegex.test(message.content);

        if (containsDiscordInvite) {
            try {
                if (message.deletable && !message.member.permissions.has('ADMINISTRATOR')) {
                    await message.delete().catch(() => null);

                    const member = message.member;

                    if (member.moderatable) {
                        await member.timeout(15 * 60 * 1000, 'Anti Link Detection').catch(console.error);
                    }

                    const logChannelId = db.get(`logprotection_${guildId}`);
                    const logChannel = message.guild.channels.cache.get(logChannelId);

                    if (logChannel && logChannel.type === 'GUILD_TEXT') {
                        const embed = new MessageEmbed()
                            .setAuthor(member.user.tag, member.user.displayAvatarURL({ dynamic: true }))
                            .setColor("#2a637b")
                            .setThumbnail('https://cdn.discordapp.com/attachments/1091536665912299530/1187529822415626320/image.png')
                            .setDescription(`**Anti Link**\n\n**To : ${member}**\n**By : ${client.user}**\n**In : ${message.channel}**\n**Muted : \`15M\`**\n\`\`\`Link : ${message.content}\`\`\``)
                            .setFooter(client.user.username, client.user.displayAvatarURL());

                        logChannel.send({ embeds: [embed] }).catch(() => null);
                    }
                }
            } catch (error) {
                console.error(`Error in anti-link system: ${error}`);
            }
        }
    });
};