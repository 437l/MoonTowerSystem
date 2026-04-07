const { MessageEmbed } = require('discord.js');
const { owners, prefix } = require(`${process.cwd()}/config`);
const Data = require('pro.db');

module.exports = {
  name: 'locomnd',
  run: (client, message, args) => {

    if (!owners.includes(message.author.id)) return message.react('❌');

    const commandName = args[0]; 

    const Color = Data.get(`Guild_Color = ${message.guild.id}`) || '#4e464f';
    if (!Color) return;

    if (!args[0]) {
      const embed = new MessageEmbed()
        .setColor(Color)
        .setDescription(`**يرجى استعمال الأمر بالطريقة الصحيحة.\n${prefix}locomnd ban**`);
      return message.reply({ embeds: [embed] });
    }

    const commandEnabled = Data.get(`command_enabled_${commandName}`);
    if (commandEnabled === undefined) {
      Data.set(`command_enabled_${commandName}`, false); 
      message.react('✅');
    } else if (!commandEnabled) {
      Data.set(`command_enabled_${commandName}`, true); 
      message.react('✅');
    } else {
      Data.set(`command_enabled_${commandName}`, false); 
      message.react('✅');
    }
  }
};
