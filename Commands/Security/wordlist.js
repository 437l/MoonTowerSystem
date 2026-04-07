const { MessageEmbed, Client } = require("discord.js");
const { owners } = require(`${process.cwd()}/config`);
const dtb = require(`pro.db`);
const Pro = require(`pro.db`);

module.exports = {
    name: "wordlist",
    aliases: ["wordlist"],
    description: "Show all words in the database.",
  
    run: async (client, message) => {


    if (!owners.includes(message.author.id)) return message.react('❌');
    const isEnabled = Pro.get(`command_enabled_${module.exports.name}`);
    if (isEnabled === false) {
        return; 
    }

        const words = dtb.get(`word_${message.guild.id}`);
        if (!Array.isArray(words) || words.length === 0) {
            return message.reply({ content: "**لا يوجد كلمات يعاقب كاتبها .**" });
        }

        const embed = new MessageEmbed()

        words.forEach((wordObject, index) => {
            const addedByUser = client.users.cache.get(wordObject.addedBy);
            const addedByTag = addedByUser?.tag || "Unknown User";

            embed.addField(
                `#${index + 1} ${wordObject.word}`,
                `By: ${addedByUser ? `<@${addedByUser.id}>` : "Unknown User"}`
            );
        });

        message.reply({ embeds: [embed] });
    }
};


   