const { MessageEmbed, MessageSelectMenu, MessageActionRow, MessageButton } = require('discord.js');
const { prefix, owners } = require(`${process.cwd()}/config`);
const ms = require('ms');
const moment = require('moment');
const Data = require('pro.db');
const db = require('pro.db');

module.exports = {
  name: 'mute',
  aliases: ["اسكت","اسكات"],
  run: async (client, message) => {
    const isEnabled = Data.get(`command_enabled_${module.exports.name}`);
    if (isEnabled === false) {
      return; 
    }
    
    const Color = db.get(`Guild_Color = ${message.guild.id}`) || '#4e464f';
    if (!Color) return;

    const Pro = require(`pro.db`);
    const allowDb = Pro.get(`Allow - Command mute = [ ${message.guild.id} ]`);
    const allowedRole = message.guild.roles.cache.get(allowDb);
    const isAuthorAllowed = message.member.roles.cache.has(allowedRole?.id);

    if (!isAuthorAllowed && message.author.id !== allowDb && !message.member.permissions.has('MUTE_MEMBERS')) {
      return;
    }

    let args = message.content.split(' ').slice(1);
    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

    if (!member) {
      const embed = new MessageEmbed()
      .setColor(`${Color || `#4e464f`}`)
        .setDescription(`**يرجى استعمال الأمر بالطريقة الصحيحة .\n${prefix}اسكت <@${message.author.id}>**`);
      return message.reply({ embeds: [embed] });
    }

    if (member.id === message.member.id) return message.react('❌');
    if (message.member.roles.highest.position < member.roles.highest.position) return message.react('❌');

    const menuOptions = [
      { label: 'إزعاج | 1', description: `10m`, value: 'إزعاج' },
      { label: 'تسبب بمشاكل | 2', description: `2h`, value: 'تسبب بمشاكل' },
      { label: 'قذف | 3', description: `3h`, value: 'قذف' },
      { label: 'تخريب فعالية | 4', description: `5h`, value: 'تخريب فعالية' },
      { label: 'إسكات دائم | 4', description: `No limit`, value: 'إسكات دائم' },
    ];

    const menu = new MessageSelectMenu()
      .setCustomId('mute_menu')
      .setPlaceholder('اختر عقوبة العضو ووقت الإسكات')
      .addOptions(menuOptions);

    const deleteButton = new MessageButton()
      .setCustomId('Cancel2')
      .setLabel('الغاء')
      .setStyle('SECONDARY');

    const menuRow = new MessageActionRow().addComponents(menu);
    const buttonRow = new MessageActionRow().addComponents(deleteButton);

    message.reply({ content: `**يرجي تحديد سبب العقوبه.**\n** * <@${member.id}>**`, components: [menuRow, buttonRow] });

    const filter = (interaction) => interaction.isSelectMenu() && interaction.user.id === message.author.id;
    const collector = message.channel.createMessageComponentCollector({ filter, time: 150000 }); 

    let interactionDetected = false; 

    collector.on('collect', (interaction) => {
      interactionDetected = true; 
    
      const selectedOption = interaction.values[0];
      let time; 
    
      if (selectedOption === 'إزعاج') {
        time = '10m';
        applyMute(member, time, selectedOption);
      } else if (selectedOption === 'تسبب بمشاكل') {
        time = '2h';
        applyMute(member, time, selectedOption);
      } else if (selectedOption === 'قذف') {
        time = '5h';
        applyMute(member, time, selectedOption);
      } else if (selectedOption === 'تخريب فعالية') {
        time = '3h'; 
        applyMute(member, time, selectedOption);
      } else if (selectedOption === 'إسكات دائم') {
        time = '15d';
        applyMute(member, time, selectedOption);
      }
    
      message.react("✅");
      interaction.message.delete();
    });
    
    collector.on('end', (collected, reason) => {
      if (!interactionDetected) {
        message.reply("**يرجى اختيار سبب !**").then(reply => {
          setTimeout(() => {
            reply.delete();
          }, 80000); // 10 ثواني :)
        });
      }
    });

    function applyMute(member, time, selectedOption) {
      let muteRole = message.guild.roles.cache.find((role) => role.name == 'Muted');
      if (!muteRole) {
        message.guild.roles.create({
          name: 'Muted',
        }).then((createRole) => {
          message.guild.channels.cache.filter((c) => c.type === 'GUILD_TEXT').forEach(c => {
            c.permissionOverwrites.edit(createRole, { SEND_MESSAGES: false, ADD_REACTIONS: false });
          });
          message.guild.channels.cache.filter((c) => c.type === 'GUILD_VOICE').forEach(c => {
            c.permissionOverwrites.edit(createRole, { ADD_REACTIONS: false });
          });
          message.guild.members.cache.get(member.id)?.roles.add(createRole);
          const endDate = moment().add(ms(time));
          const logData = {
            time: time,
            times: endDate.format('LLLL'),
            reason: selectedOption,
            channel: message.channel.id,
            by: message.author.id,
            to: member.id
          };
          db.set(`Muted_Member_${member.id}`, logData);
          setTimeout(() => {
            message.guild.members.cache.get(member.id)?.roles.remove(createRole);
            db.delete(`Muted_Member_${member.id}`);
          }, ms(time));
    
          const logEmbed = new MessageEmbed()
            .setColor('#312e5d')
            .setAuthor(member.user.tag, member.user.displayAvatarURL({ dynamic: true }))
            .setDescription(`**إسكات كتابي\n\nالعضو : <@${logData.to}>\nبواسطة : <@${logData.by}>\nالرسالة : [here](${message.url})\nالوقت : \`${logData.time}\`**\n\`\`\`Prison : ${logData.reason}\`\`\` `)
            .setThumbnail(`https://cdn.discordapp.com/attachments/1091536665912299530/1153875266066710598/image_1.png`)
            .setFooter({ text: `${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) });
    
          let logChannel = db.get(`logtmuteuntmute_${message.guild.id}`);
          logChannel = message.guild.channels.cache.find(channel => channel.id === logChannel);
    
          if (logChannel) {
            logChannel.send({ embeds: [logEmbed] });
          }
        });
      } else {
        message.guild.members.cache.get(member.id)?.roles.add(muteRole);
        const endDate = moment().add(ms(time));
        const logData = {
          time: time,
          times: endDate.format('LLLL'),
          reason: selectedOption,
          channel: message.channel.id,
          by: message.author.id,
          to: member.id
        };
        db.set(`Muted_Member_${member.id}`, logData);
        setTimeout(() => {
          message.guild.members.cache.get(member.id)?.roles.remove(muteRole);
          db.delete(`Muted_Member_${member.id}`);
        }, ms(time));
    
        const logEmbed = new MessageEmbed()
          .setColor('#312e5d')
          .setAuthor(member.user.tag, member.user.displayAvatarURL({ dynamic: true }))
          .setDescription(`**إسكات كتابي\n\nالعضو : <@${logData.to}>\nبواسطة : <@${logData.by}>\nالرسالة : [here](${message.url})\nالوقت : \`${logData.time}\`**\n\`\`\`Prison : ${logData.reason}\`\`\` `)
          .setThumbnail(`https://cdn.discordapp.com/attachments/1091536665912299530/1153875266066710598/image_1.png`)
          .setFooter({ text: `${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) });
    
        let logChannel = db.get(`logtmuteuntmute_${message.guild.id}`);
        logChannel = message.guild.channels.cache.find(channel => channel.id === logChannel);
    
        if (logChannel) {
          logChannel.send({ embeds: [logEmbed] });
        }
      }
    }
    

    client.on('interactionCreate', async (interaction) => {
      if (!interaction.isButton()) return;

      if (interaction.customId === 'Cancel2') {
        interaction.message.delete();
      }
    });
  }
};
