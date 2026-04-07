const { MessageEmbed, MessageSelectMenu, MessageActionRow, MessageButton, Permissions } = require('discord.js');
const { prefix, owners } = require(`${process.cwd()}/config`);
const ms = require('ms');
const moment = require('moment');
const db = require('pro.db');

module.exports = {
  name: 'prison',
  aliases: ['سجن'],
  run: async (client, message) => {
    const isEnabled = db.get(`command_enabled_${module.exports.name}`);
    if (isEnabled === false) {
      return;
    }

    const Color = db.get(`Guild_Color = ${message.guild.id}`) || '#4e464f';
    if (!Color) return;
    
    const allowDb = db.get(`Allow - Command prison = [ ${message.guild.id} ]`);
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
        .setDescription(`**يرجى استعمال الأمر بالطريقة الصحيحة .\n${prefix}سجن <@${message.author.id}>**`);
      return message.reply({ embeds: [embed] });
    }

    if (member.id === message.member.id) return message.react('❌');
    if (message.member.roles.highest.position < member.roles.highest.position) return message.react('❌');

    const menuOptions = [
      { label: 'مشاكل متكررة | 1', description: `1d`, value: 'مشاكل متكررة.' },
      { label: 'قذف , سب , تشفير | 2', description: `2d`, value: 'قذف , سب , تشفير' },
      { label: 'يدخل حسابات وهمية | 3', description: `3d`, value: 'يدخل حسابات وهمية' },
      { label: 'يُروج فالخاص لسيرفر | 4', description: `5d`, value: 'يُروج فالخاص لسيرفر' },
    ];

    const menu = new MessageSelectMenu()
      .setCustomId('prison_menu')
      .setPlaceholder('اختر عقوبة العضو ووقت السجن')
      .addOptions(menuOptions);

    const deleteButton = new MessageButton()
      .setCustomId('Cancel')
      .setLabel('الغاء')
      .setStyle('SECONDARY');

    const menuRow = new MessageActionRow().addComponents(menu);
    const buttonRow = new MessageActionRow().addComponents(deleteButton);

    message.reply({ content: `**يرجي تحديد سبب العقوبه.**\n** * <@${member.id}>**`, components: [menuRow, buttonRow] });

    const filter = (interaction) => interaction.isSelectMenu() && interaction.user.id === message.author.id;

    const collector = message.channel.createMessageComponentCollector({ filter, time: 150000 });

    collector.on('collect', async (interaction) => {
      const selectedOption = interaction.values[0];
      const time = selectedOption === 'مشاكل متكررة.' ? '1d' :
      selectedOption === 'قذف , سب , تشفير' ? '2d' :
      selectedOption === 'يدخل حسابات وهمية' ? '2d' :
      selectedOption === 'يدخل حسابات وهمية' ? '2d' :
      selectedOption === 'يُروج فالخاص لسيرفر' ? '5d' : Infinity;
      Infinity;


      const endDate = moment().add(ms(time));

      let prisonRole = message.guild.roles.cache.find(role => role.name === 'prison');
      if (!prisonRole) {
        prisonRole = await message.guild.roles.create({
          name: 'prison',
          permissions: [
            Permissions.FLAGS.VIEW_CHANNEL,
            Permissions.FLAGS.READ_MESSAGE_HISTORY
          ]
        });

        message.guild.channels.cache.filter(channel => channel.type === 'GUILD_TEXT').forEach(channel => {
          channel.permissionOverwrites.create(prisonRole, {
            SEND_MESSAGES: false,
            VIEW_CHANNEL: false
          });
        });

        message.guild.channels.cache.filter(channel => channel.type === 'GUILD_VOICE').forEach(channel => {
          channel.permissionOverwrites.create(prisonRole, {
            VIEW_CHANNEL: true
          });
        });
      }

      await member.roles.add(prisonRole);

      const logData = {
        time: time,
        times: endDate.format('LLLL'),
        reason: selectedOption,
        channel: message.channel.id,
        by: message.author.id,
        to: member.id
      };

      db.set(`MutedMember_${member.id}`, logData);

      const timeLeft = ms(ms(time), { long: true });
      message.react("✅");
      interaction.message.delete();

      let logChannel = db.get(`logprisonunprison_${message.guild.id}`);
      logChannel = message.guild.channels.cache.find(channel => channel.id === logChannel);

      if (logChannel) {
        const logEmbed = new MessageEmbed()
          .setAuthor(member.user.tag, member.user.displayAvatarURL({ dynamic: true }))
          .setColor('#707487')
          .setDescription(`**سجن عضو\n\nالعضو : <@${member.id}>\nبواسطة : <@${message.author.id}>\n[Message](${message.url})\nالوقت : \`${timeLeft}\`\nينفك فيـ : \`${endDate.format('LLLL')}\`**\n\`\`\`Prison : ${selectedOption}\`\`\``)
          .setThumbnail('https://cdn.discordapp.com/attachments/1091536665912299530/1224588302393540638/bars.png?ex=661e09bb&is=660b94bb&hm=198f684aacf261c80430479f57f365b8c3dd11aa914b5c382240a2adbe33b00a&')
          .setFooter({ text: `${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) });

        logChannel.send({ embeds: [logEmbed] });
      }

      setTimeout(async () => {
        db.delete(`MutedMember_${member.id}`);
        const muteRole = message.guild.roles.cache.find(role => role.name === 'prison');
        if (muteRole) await member.roles.remove(muteRole);
      }, ms(time));
    });

    collector.on('end', (collected, reason) => {
      if (!collected.size) {
        message.reply("**يرجى اختيار سبب !**").then(reply => {
          setTimeout(() => {
            reply.delete();
          }, 80000); //
        });
      }
    });

    client.on('interactionCreate', async (interaction) => {
      if (!interaction.isButton()) return;
    
      if (interaction.customId === 'Cancel') {
        const member = interaction.guild.members.cache.get(interaction.message.mentions.members.first().id);
        const muteRole = interaction.guild.roles.cache.find(role => role.name === 'prison');
        if (muteRole) await member.roles.remove(muteRole);
        await interaction.message.delete();
      }
    });
    
  }
};
