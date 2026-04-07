const fs = require("fs");
const { MessageEmbed } = require("discord.js");
const { prefix, owners } = require(`${process.cwd()}/config`);
const { Util } = require('discord.js');
const Pro = require(`pro.db`);
const axios = require(`axios`)
const emojiFolder = `${process.cwd()}/Saved/aemoji`;

if (!fs.existsSync(emojiFolder)) {
    fs.mkdirSync(emojiFolder);
}

module.exports = {
    name: 'aemoji',
    aliases: ["eo"],
    run: async (client, message) => {
        const isEnabled = Pro.get(`command_enabled_${module.exports.name}`);
        if (isEnabled === false) {
            return;
        }

        const Color = Pro.get(`Guild_Color = ${message.guild.id}`) || '#4e464f';
        if (!Color) return;

        if (message.author.bot) return;

        const db = Pro.get(`Allow - Command aemoji = [ ${message.guild.id} ]`);
        const allowedRole = message.guild.roles.cache.get(db);
        const isAuthorAllowed = message.member.roles.cache.has(allowedRole?.id);

        if (!isAuthorAllowed && message.author.id !== db && !message.member.permissions.has('MANAGE_EMOJIS')) {
            return;
        }

        const emojisInContent = message.content.match(/<?(a)?:?(\w{2,32}):(\d{17,19})>?/gi);
        if (!emojisInContent) {
            const embed = new MessageEmbed()
                .setColor(`${Color || `#4e464f`}`)
                .setDescription(`**يرجى استعمال الأمر بالطريقة الصحيحة .\n${prefix}aemoji 😘😢**`);
            await message.reply({ embeds: [embed] });
            return;
        }

        const emojisArray = [];

        for (const emote of emojisInContent) {
            const emoji = Util.parseEmoji(emote);
            if (emoji.id) {
                const link = `https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? 'gif' : 'png'}`;
                try {
                    const createdEmoji = await message.guild.emojis.create(link, emoji.name);
                    emojisArray.push(createdEmoji.toString());
                    // حفظ الأيموجي المنشأ في المجلد
                    const emojiFile = fs.createWriteStream(`${emojiFolder}/${createdEmoji.name}.${emoji.animated ? 'gif' : 'png'}`);
                    const response = await axios({
                        url: createdEmoji.url,
                        method: 'GET',
                        responseType: 'stream'
                    });
                    response.data.pipe(emojiFile);
                    let logChannelId = Pro.get(`logemoji_${message.guild.id}`);
                    let logChannel = client.channels.cache.get(logChannelId);
                    if (logChannel) {
                        const emojiEmbed = new MessageEmbed()
                        .setAuthor({
                            name: message.author.tag,
                            iconURL: message.author.displayAvatarURL({ dynamic: true, size: 1024, format: 'png' })
                        })
                        
                            .setColor(`#546a71`)
                            .setDescription(`**إضافة إيموجي**\n\n**بواسطة : <@${message.author.id}>**\n**الإيموجي : ${createdEmoji.toString()}**\n**رابط الإمويجي :** [Link](${createdEmoji.url})`)
                            .setThumbnail(createdEmoji.url)
                            .setFooter(client.user.username, client.user.displayAvatarURL())
                        logChannel.send({ embeds: [emojiEmbed] });
                    }
                } catch (error) {
                    if (error.message.includes('No emoji slots available')) {
                        await message.reply("Emoji - 0 slots available");
                    } else {
                        console.error(error);
                    }
                }
            }
        }

        if (emojisArray.length > 0) {
            await message.react("✅");
        }
    }
}
