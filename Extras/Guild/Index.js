const { Client, intents, Collection, MessageEmbed, MessageAttachment, MessageActionRow, MessageButton,
MessageSelectMenu, WebhookClient, MessageModal, Role, Modal, TextInputComponent, Permissions } = require("discord.js");
const { createCanvas, registerFont, canvas, loadImage, generateCard} = require("canvas")
const Discord = require("discord.js")
var { inviteTracker } = require("discord-inviter");
let client = require('../..')
const fs = require("fs")
const ms = require(`ms`)
const { prefix, owners, Guild, token} = require(`${process.cwd()}/config`);
const config = require(`${process.cwd()}/config`);
const Data = require("pro.db")
const db = require(`pro.db`)
module.exports = client;
client.config = require(`${process.cwd()}/config`);
//const tracker = new inviteTracker(client);
const { createTranscript } = require("discord-html-transcripts");
const { Canvas, loadFont } = require('canvas-constructor/cairo');
const humanizeDuration = require('humanize-duration');
const emojione = require('emojione');

// ------------------------------ voice state logs ------------------------------

const timers = new Map();
client.on('voiceStateUpdate', async (oldState, newState) => {
  const userId = newState.member.id;
  const voiceChannel = newState.channel;
    if (newState.member.user.bot) return;

  if (oldState.channel === null && voiceChannel !== null) {
      const timer = setInterval(async () => {
        let userPoints = (await Data.fetch(`${userId}_voice`)) || 0;
        await Data.set(`${userId}_voice`, userPoints + 1);
      }, 480000); 
      timers.set(userId, timer);
  }
  if (oldState.channel !== null && voiceChannel === null) {
      if (timers.has(userId)) {
          clearInterval(timers.get(userId));
          timers.delete(userId);
      }
  }
});

// ------------------------------ save server backup ------------------------------
const saveBackup = async (data, iconURL) => {
  try {
      const response = await fetch(iconURL);
      const buffer = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync('./Saved/icon.png', buffer);
      fs.writeFileSync('./Saved/backup.json', JSON.stringify(data, null, 4));
      console.log('\x1b[32mBackup saved successfully.\x1b[0m');
  } catch (error) {
      console.error('Error saving backup:', error);
  }
};

client.on('ready', async () => {
  const guildId = Guild; 

  const backup = async () => {
      const guild = client.guilds.cache.get(guildId);
      if (!guild) {
          return;
      }

      const iconURL = guild.iconURL();
      if (!iconURL) {
          return;
      }

      const backupData = {
          serverName: guild.name,
          categories: [],
          roles: [],
      };

      const categories = guild.channels.cache.filter(channel => channel.type === 'GUILD_CATEGORY');
      categories.forEach(category => {
          const categoryData = {
              id: category.id,
              name: category.name,
              channels: [],
              permissions: [],
          };
          category.permissionOverwrites.cache.forEach(perm => {
              const permData = {
                  id: perm.id,
                  type: perm.type,
                  allow: new Permissions(perm.allow.bitfield).toArray(),
                  deny: new Permissions(perm.deny.bitfield).toArray(),
              };
              categoryData.permissions.push(permData);
          });
          category.children.forEach(channel => {
              const channelData = {
                  id: channel.id,
                  name: channel.name,
                  type: channel.type,
                  permissions: channel.permissionOverwrites.cache.map(perm => ({
                      id: perm.id,
                      type: perm.type,
                      allow: new Permissions(perm.allow.bitfield).toArray(),
                      deny: new Permissions(perm.deny.bitfield).toArray(),
                  })),
              };
              categoryData.channels.push(channelData);
          });
          backupData.categories.push(categoryData);
      });

      const roles = guild.roles.cache.filter(role => !role.managed && role.name !== '@everyone');
      const rolesData = roles.map(role => ({
          id: role.id,
          name: role.name,
          color: role.color,
          permissions: new Permissions(role.permissions.bitfield).toArray(),
      }));
      backupData.roles = rolesData;

      await saveBackup(backupData, iconURL);
  };

  setInterval(backup, 24 * 60 * 60 * 1000); 
  await backup();
});

// ------------------------------ blacklist ------------------------------
client.on('guildMemberAdd', async member => {
  const isBlocked = await Data.get(`blockedUsers_${member.id}`);
  if (isBlocked) {
    try {
      await member.kick('You are in the blacklist.');

      const logkick = Data.get(`logkick_${member.guild.id}`); // Fetching log kick channel ID from the database
      const logChannel = member.guild.channels.cache.get(logkick);
      if (logChannel) {
        const blockedUser = await client.users.fetch(member.id);
        const serverName = member.guild.name;
        const serverIcon = member.guild.iconURL();
        const blockEmbed = new MessageEmbed()
          .setColor(`#493042`)
          .setAuthor(serverName, serverIcon)
          .setDescription(`**طرد عضو\n\nالعضو : <@${member.id}>**\n\`\`\`Reason : بالقائمة السوداء\`\`\`\ `)
          .setThumbnail(`https://cdn.discordapp.com/attachments/1091536665912299530/1209563150119211138/F4570260-9C71-432E-87CC-59C7B4B13FD4.png?ex=65e76077&is=65d4eb77&hm=5d7ef4be2c19a4f52c29255991dc129b53cf33d11c8d962ea0573cd72feaf3ac&`)
          .setFooter(blockedUser.username, blockedUser.displayAvatarURL({ format: 'png', dynamic: true, size: 128 }))          
        logChannel.send({ embeds: [blockEmbed] });
      }
    } catch (error) {
      console.error(error);
    }
  }
});


// ------------------------------ invite bot tracke ------------------------------

var { inviteTracker } = require("discord-inviter"), tracker = new inviteTracker(client);
tracker.on('guildMemberAdd', async (member, inviter) => {
    const canvas = createCanvas(826, 427);
    const ctx = canvas.getContext('2d');
    let backgroundImageURL = Data.get(`imgwlc_${member.guild.id}`) || `${process.cwd()}/Fonts/wlc.png`;

    try {
        const backgroundImage = await loadImage(backgroundImageURL);
        canvas.width = backgroundImage.width;
        canvas.height = backgroundImage.height;
        ctx.drawImage(backgroundImage, 0, 0);
    } catch (error) {
    }

    const avatar = await loadImage(member.user.displayAvatarURL({ format: 'png', size: 512 }));
    const avatarUpdates = Data.get(`editwel_${member.guild.id}`) || { size: 260, x: 233, y: 83.5, isCircular: true };

    const { size, x, y, isCircular } = avatarUpdates;
    ctx.save();
    if (isCircular) {
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
    }
    ctx.drawImage(avatar, x, y, size, size);
    ctx.restore();


    const fetchedLogs = await member.guild.fetchAuditLogs({
        limit: 1,
        type: 'BOT_ADD',
    });
    const BotLog = fetchedLogs.entries.first();
    const { executor } = BotLog;
    const invites = await member.guild.invites.fetch();
    const inviterInvite = invites.find((invite) => invite.inviter.id === executor.id);

    const mesg = Data.get(`mesg_message_${member.guild.id}`) || '';
    let finalMessage = mesg.replace(/\[user\]/g, `<@${member.id}>`);

    if (inviter) {
        finalMessage = finalMessage.replace(/\[inviter\]/g, `<@${inviter.id}>`);
    }

    finalMessage = finalMessage.replace(/\[membercount\]/g, member.guild.memberCount); 
    finalMessage = finalMessage.replace(/\[servername\]/g, member.guild.name);
    const nameUpdates = Data.get(`editname_${member.guild.id}`);
    if (nameUpdates) {
        const { size: nameSize, x: nameX, y: nameY } = nameUpdates;
        ctx.font = `bold ${nameSize}px Cairo`; 
        ctx.fillStyle = '#FFFFFF'; 
        ctx.fillText(member.user.displayName, nameX, nameY); 
    }
    
    

    const chatwlc = Data.get(`chat_wlc_${member.guild.id}`);
    const channel = member.guild.channels.cache.find(c => c.id === chatwlc && c.type === 'GUILD_TEXT');

    if (channel) {
        await channel.send({ files: [canvas.toBuffer()] });
        if (finalMessage.trim() !== '') {
            setTimeout(async () => {
                await channel.send({ content: finalMessage });
            }, 1000);
        }
    }
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.isSelectMenu()) {
    if (interaction.customId.startsWith("temp_limit")) {
      const temp_channels = JSON.parse(fs.readFileSync('temp_channels.json', 'utf-8'));

      if (
        interaction.member.voice.channelId == null ||
        (interaction.member.voice.channelId !== null && !temp_channels[interaction.member.voice.channelId])
      ) {
        return await interaction.reply({
          content: "You don't dave a channel.",
          ephemeral: true,
        });
      }

      if (
        !interaction.member.voice.channel
          .permissionsFor(interaction.member)
          .has("MANAGE_CHANNELS")
      ) {
        return await interaction.reply({
          content: "You don't dave a channel.",
          ephemeral: true,
        });
      }

      await interaction.deferReply({ ephemeral: true });
      await interaction.member.voice.channel
        .setUserLimit(+interaction.values[0])
        .catch(console.error);

      await interaction.editReply({
        embeds: [
          {
            title: "Done ✅",
            fields: [
              {
                name: "Selected Channel",
                value: `<#${interaction.member.voice.channelId}>`,
              },
            ],
            color: 0x0cd8fa,
            timestamp: new Date(),
          },
        ],
        ephemeral: true,
      });
    }
  }

  if (interaction.customId.startsWith("temp_rename")) {
    if (interaction.isModalSubmit()) {
      await interaction.reply({
        ephemeral: true,
        embeds: [
          {
            title: "Please Wait",
            description: `Your Temp Channel is Changing`,
            fields: [
              {
                name: "Note:",
                value:
                  "تحذير : إذا قمت بتغيير الاسم أكثر من مرتين ، فلا يمكنك تغيير اسمك الجديد مرة أخرى لمدة 10 دقائق",
              },
            ],
            color: 0x0cd8fa,
          },
        ],
      });

      let guild = await client.guilds.fetch(interaction.guildId);
      let channel = await guild.channels.cache.get(
        interaction.customId.split("_")[2],
      );

      await channel
        .edit({
          name: interaction.fields.getTextInputValue("new_name"),
        })
        .catch(console.error);

      await interaction.editReply({
        embeds: [
          {
            title: "Done ✅",
            fields: [
              {
                name: "Selected Channel",
                value: `<#${interaction.member.voice.channelId}>`,
              },
            ],
            color: 0x0cd8fa,
            timestamp: new Date(),
          },
        ],
        ephemeral: true,
      });
    }
  }

  if (interaction.customId.startsWith("temp_kick_confirm")) {
    const channelId = interaction.customId.split("_")[3];
    const selectedMemberId = interaction.values[0];
    const channel = interaction.guild.channels.cache.get(channelId);
    const memberToKick = interaction.guild.members.cache.get(selectedMemberId);
    if (memberToKick) {
      await memberToKick.voice.disconnect(
        "Kicked from the temp channel by owner.",
      );
    }
    const kickConfirmationEmbed = new MessageEmbed()
      .setColor("#FF0000")
      .setTitle("Member Kicked")
      .setDescription(
        `Kicked ${memberToKick.displayName} from the temp channel.`,
      );

    await interaction.reply({
      embeds: [kickConfirmationEmbed],
      ephemeral: true,
    });
  }

  if (interaction.isButton()) {
    if (interaction.customId.startsWith("temp")) {
      const temp_channels = JSON.parse(fs.readFileSync('temp_channels.json', 'utf-8'));

      if (
        interaction.member.voice.channelId == null ||
        (interaction.member.voice.channelId !== null && !temp_channels[interaction.member.voice.channelId])
      ) {
        return await interaction.reply({
          embeds: [
            { color: "RED", description: "You don't dave a channel." },
          ],
          ephemeral: true,
        });
      }

      if (
        !interaction.member.voice.channel
          .permissionsFor(interaction.member)
          .has("MANAGE_CHANNELS")
      ) {
        return await interaction.reply({
          embeds: [
            {
              color: "RED",
              description:
                "You do not have permission to control the temporary Channel.",
            },
          ],
          ephemeral: true,
        });
      }

      const channelOwnerId = temp_channels[interaction.member.voice.channelId];
      if (interaction.member.id !== channelOwnerId) {
        return await interaction.reply({
          embeds: [
            {
              color: "RED",
              description: "You are not the owner of this channel.",
            },
          ],
          ephemeral: true,
        });
      }

      try {
        switch (interaction.customId.split("_")[1]) {
          case "rename":
            const modal = new Modal()
              .setCustomId(`temp_rename_${interaction.member.voice.channelId}`)
              .setTitle("Rename");
            const NewName = new TextInputComponent()
              .setCustomId("new_name")
              .setLabel("New Name")
              .setStyle("SHORT");
            const firstActionRow = new MessageActionRow().addComponents(
              NewName,
            );
            modal.addComponents(firstActionRow);
            await interaction.showModal(modal);
            break;
          case "private":
            await interaction.member.voice.channel.permissionOverwrites.edit(
              interaction.guild.id,
              { VIEW_CHANNEL: false },
            );
            await interaction.reply({
              embeds: [
                {
                  color: "GREEN",
                  description:
                    "This channel is now private. Only selected members can view it.",
                },
              ],
              ephemeral: true,
            });
            break;
          case "public":
            await interaction.member.voice.channel.permissionOverwrites.edit(
              interaction.guild.id,
              { VIEW_CHANNEL: true },
            );
            await interaction.reply({
              embeds: [
                {
                  color: "GREEN",
                  description:
                    "This channel is now public. Everyone can view it.",
                },
              ],
              ephemeral: true,
            });
            break;
          case "unmute":
            await interaction.member.voice.channel.permissionOverwrites.edit(
              interaction.guild.id,
              { SPEAK: true },
            );
            await interaction.reply({
              embeds: [
                {
                  color: "GREEN",
                  description:
                    "Channel is now unmuted. Members can speak freely.",
                },
              ],
              ephemeral: true,
            });
            break;
          case "mute":
            await interaction.member.voice.channel.permissionOverwrites.edit(
              interaction.guild.id,
              { SPEAK: false },
            );
            await interaction.reply({
              embeds: [
                {
                  color: "GREEN",
                  description: "Channel is now muted. Members cannot speak.",
                },
              ],
              ephemeral: true,
            });
            break;
          case "disconnect":
            await interaction.member.voice.disconnect();
            await interaction.reply({
              embeds: [
                {
                  color: "ORANGE",
                  description:
                    "You have been disconnected from the voice channel.",
                },
              ],
              ephemeral: true,
            });
            break;
          case "hide":
            await interaction.member.voice.channel.permissionOverwrites.edit(
              interaction.guild.id,
              { VIEW_CHANNEL: false },
            );
            await interaction.reply({
              embeds: [
                {
                  color: "GREEN",
                  description: "This channel is now hidden from non-members.",
                },
              ],
              ephemeral: true,
            });
            break;
          case "unhide":
            await interaction.member.voice.channel.permissionOverwrites.edit(
              interaction.guild.id,
              { VIEW_CHANNEL: true },
            );
            await interaction.reply({
              embeds: [
                {
                  color: "GREEN",
                  description: "This channel is now visible to everyone.",
                },
              ],
              ephemeral: true,
            });
            break;
          case "kickuser":
            if (!interaction.member.voice.channel) return;
            if (!temp_channels[interaction.member.voice.channelId])
              return;

            const memberOptions = [];
            interaction.member.voice.channel.members.forEach((member) => {
              if (!member.user.bot) {
                memberOptions.push({
                  label: member.displayName,
                  value: member.id,
                });
              }
            });

            const kickSelectMenu = new MessageSelectMenu()
              .setCustomId(
                "temp_kick_confirm_" +
                  interaction.member.voice.channelId +
                  "_" +
                  Date.now(),
              )
              .setPlaceholder("Select Member to Kick")
              .addOptions(memberOptions);

            const actionRow = new MessageActionRow().addComponents(
              kickSelectMenu,
            );

            await interaction.reply({
              content: "Select a member to kick:",
              components: [actionRow],
              ephemeral: true,
            });
            break;
          default:
            await interaction.reply({
              embeds: [{ color: "RED", description: "Unknown command." }],
              ephemeral: true,
            });
        }
      } catch (error) {
        console.error(error);
        await interaction.reply({
          embeds: [
            {
              color: "RED",
              description: "An error occurred while processing your request.",
            },
          ],
          ephemeral: true,
        });
      }
    }
  }
});