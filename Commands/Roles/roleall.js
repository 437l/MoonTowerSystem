const { MessageActionRow, MessageButton, MessageSelectMenu, MessageEmbed } = require("discord.js");
const { prefix, owners } = require(`${process.cwd()}/config`);
const Pro = require(`pro.db`);


module.exports = {
    name: 'allrole', // هنا اسم الامر
    aliases: ["roleall"],

    run : (client, message, args) => {



        const Color = Pro.get(`Guild_Color = ${message.guild.id}`) || '#4e464f';
        if (!Color) return;


        const db = Pro.get(`Allow - Command allrole = [ ${message.guild.id} ]`)
const allowedRole = message.guild.roles.cache.get(db);
const isAuthorAllowed = message.member.roles.cache.has(allowedRole?.id);

if (!isAuthorAllowed && message.author.id !== db  && !message.member.permissions.has('ADMINISTRATOR')) {
    return message.react(`❌`)
}

//     if (!message.member.permissions.has('ADMINISTRATOR')) return message.react(`❌`)
    var rrole = message.content.split(" ").slice(1).join(" ");
    var role = message.mentions.roles.first() || message.guild.roles.cache.find(r => r.name === rrole)||message.guild.roles.cache.find(r => r.id === rrole);
    if (!role) {
        const embed = new MessageEmbed()
          .setColor(`${Color || `#4e464f`}`)
          .setDescription(`**يرجى استعمال الأمر بالطريقة الصحيحة .\n${prefix}roleall <@رول>**`);
  
        message.reply({ embeds: [embed] });
        return;
      }


    
    message.guild.members.cache.forEach(async m => {
        await m.roles.add(role)
    })
    message.react("✅")
 
    }
}

