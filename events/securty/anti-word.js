const { MessageEmbed } = require("discord.js");
const db = require("pro.db");

module.exports = async (client) => {
    client.on("messageCreate", async (message) => {
        if (!message.guild || message.author.bot) return;

        const guildId = message.guild.id;
        const owners = db.get(`owners_${guildId}`) || [];
        if (owners.includes(message.author.id)) return;

        const wanti = db.get(`wanti_${guildId}`);
        if (wanti && wanti.includes(message.author.id)) return;

        const words = db.get(`word_${guildId}`);
        if (!Array.isArray(words) || words.length === 0) return;

        const contentLower = message.content.toLowerCase();

        for (const wordObject of words) {
            const forbiddenWord = wordObject.word.toLowerCase();

            if (contentLower.includes(forbiddenWord) && !(/^\d+$/.test(forbiddenWord))) {
                const logChannelId = db.get(`logprotection_${guildId}`);
                const logChannel = message.guild.channels.cache.get(logChannelId);

                try {
                    if (message.member.moderatable) {
                        await message.member.timeout(15 * 60 * 1000, 'Anti Word Detection');
                    }

                    if (logChannel && logChannel.type === 'GUILD_TEXT') {
                        const embed = new MessageEmbed()
                            .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true }))
                            .setDescription(`**Anti Word\n\nTo : ${message.author}\nBy : ${client.user}\nIn : ${message.channel}\nTimeout : \`15M\`**\n\`\`\`Reason : ${message.content}\`\`\``)
                            .setThumbnail('https://cdn.discordapp.com/attachments/1091536665912299530/1187501360292298803/image.png')
                            .setFooter(client.user.username, client.user.displayAvatarURL())
                            .setColor("#783e63");

                        logChannel.send({ embeds: [embed] }).catch(() => null);
                    }

                    if (message.deletable) {
                        await message.delete().catch(() => null);
                    }
                } catch (error) {
                    console.error("Error in anti-word system:", error);
                }
                break;
            }
        }
    });
};