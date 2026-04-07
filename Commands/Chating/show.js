const { MessageEmbed } = require("discord.js");
const db = require(`pro.db`);

module.exports = {
  name: "show",
  aliases: ["اظهار"],
  description: "show chat",
  usage: ["!show"],
  run: async (client, message, args, config) => {

         const Pro = require(`pro.db`)
        const db = Pro.get(`Allow - Command hide = [ ${message.guild.id} ]`)
const allowedRole = message.guild.roles.cache.get(db);
const isAuthorAllowed = message.member.roles.cache.has(allowedRole?.id);

if (!isAuthorAllowed && message.author.id !== db  && !message.member.permissions.has('MANAGE_CHANNELS')) {
    return;
}

const isEnabled = Pro.get(`command_enabled_${module.exports.name}`);
if (isEnabled === false) {
    return; 
}


                let everyone = message.guild.roles.cache.find(hyper => hyper.name === '@everyone');
                message.channel.permissionOverwrites.edit(everyone, {
                        VIEW_CHANNEL: true
                }).then(() => {
                        message.react("✅").catch((err) => {
                                console.log(`لم أتمكن من الرد على الرسالة:` + err.message)
                        })
                })
        }
};