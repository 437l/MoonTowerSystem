const { MessageEmbed } = require("discord.js");
const db = require("pro.db");

const spamThreshold = 5;
const spamTimeframe = 1 * 60 * 1000;
const spamCache = new Map();

module.exports = async (client) => {
    client.on('messageCreate', async (message) => {
        if (!message.guild || message.author.bot) return;

        const spamProtectionEnabled = db.get(`spamProtectionEnabled_${message.guild.id}`);
        if (!spamProtectionEnabled) return;

        const owners = db.get(`owners_${message.guild.id}`) || [];
        if (owners.includes(message.author.id)) return;

        const wanti = db.get(`wanti_${message.guild.id}`);
        if (wanti && wanti.includes(message.author.id)) return;

        const authorId = message.author.id;
        const currentTime = Date.now();

        if (spamCache.has(authorId)) {
            const userData = spamCache.get(authorId);
            const { lastMessageTime, messageContent, messagesToDelete, messageCount } = userData;

            const timeDifference = currentTime - lastMessageTime;
            if (timeDifference < spamTimeframe && messageContent === message.content) {
                userData.lastMessageTime = currentTime;
                userData.messageCount = messageCount + 1;
                userData.messagesToDelete.push(message);
                spamCache.set(authorId, userData);

                if (userData.messageCount >= spamThreshold) {
                    const logChannelId = db.get(`logprotection_${message.guild.id}`);
                    const logChannel = message.guild.channels.cache.get(logChannelId);
                    
                    if (logChannel && logChannel.type === 'GUILD_TEXT') {
                        const embed = new MessageEmbed()
                            .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true }))
                            .setColor('#ffd1c8')
                            .setDescription(`**Anti Spam\n\nby : ${message.author}\nPunishment : \`Mute 1m\`**\n\`\`\`message : ${message.content}\`\`\``)
                            .setThumbnail("https://cdn.discordapp.com/attachments/1091536665912299530/1223078036757418117/dog-training.png")
                            .setFooter(client.user.username, client.user.displayAvatarURL());

                        logChannel.send({ embeds: [embed] }).catch(() => null);
                    }

                    for (const msg of userData.messagesToDelete) {
                        if (msg.deletable) await msg.delete().catch(() => null);
                    }

                    let timeoutRole = message.guild.roles.cache.find(role => role.name.toLowerCase() === "mute" || role.name.toLowerCase() === "muted");

                    if (!timeoutRole) {
                        try {
                            timeoutRole = await message.guild.roles.create({
                                name: 'Muted',
                                permissions: []
                            });

                            message.guild.channels.cache.forEach(async (channel) => {
                                if (channel.isText()) {
                                    await channel.permissionOverwrites.edit(timeoutRole, {
                                        SEND_MESSAGES: false,
                                        ADD_REACTIONS: false
                                    }).catch(() => null);
                                }
                            });
                        } catch (error) {
                            console.error(error);
                        }
                    }

                    if (timeoutRole) {
                        message.member.roles.add(timeoutRole).then(() => {
                            setTimeout(() => {
                                message.member.roles.remove(timeoutRole).catch(() => null);
                            }, 60000);
                        }).catch(() => null);
                    }

                    userData.messageCount = 0;
                    userData.messagesToDelete = [];
                }
            } else {
                userData.lastMessageTime = currentTime;
                userData.messageCount = 1;
                userData.messageContent = message.content;
                userData.messagesToDelete = [message];
                spamCache.set(authorId, userData);
            }
        } else {
            spamCache.set(authorId, {
                lastMessageTime: currentTime,
                messageCount: 1,
                messageContent: message.content,
                messagesToDelete: [message],
            });
        }
    });
};