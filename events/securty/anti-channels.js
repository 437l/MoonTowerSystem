 const db = require("pro.db");
  module.exports = async (client, channel) => {

    const deletedChannelsCount = new Map();
    const deleteTimestamps = new Map();
    const createdChannelsCount = new Map(); 
    const createTimestamps = new Map(); 
    const maxDeletes = 3; 
    const resetTime = 3 * 60 * 1000; 
    
    client.on('channelDelete', async (deletedChannel) => {
      let logantidelete = Data.get(`logantidelete_${deletedChannel.guild.id}`);
        const antiDeleteEnabled = Data.get(`antiDelete-${deletedChannel.guild.id}`);
        if (!antiDeleteEnabled) return; 
    
        if (deletedChannel.type === 'GUILD_TEXT' || deletedChannel.type === 'GUILD_VOICE' || deletedChannel.type === 'GUILD_CATEGORY') {
            const guild = deletedChannel.guild;
            const channelName = deletedChannel.name;
            const channelType = deletedChannel.type;
            const guildId = deletedChannel.guild.id;
    
            try {
                const logs = await guild.fetchAuditLogs({ type: 'CHANNEL_DELETE' });
                const entry = logs.entries.first();
                
                if (entry && entry.executor.id === client.user.id) {
                    return; 
                }
    
    
                        if (owners.includes(entry.executor.id)) return;
                        const wanti = Data.get(`wanti_${guildId}`);
                        if (wanti && wanti.includes(entry.executor.id)) return;
    
                const parentCategory = deletedChannel.parent;
                let recreatedChannel;
                if (parentCategory) {
                    recreatedChannel = await guild.channels.create(channelName, { type: channelType, parent: parentCategory });
                } else {
                    recreatedChannel = await guild.channels.create(channelName, { type: channelType });
                }
    
                if (entry) {
                    const user = entry.executor;
    
                    const now = Date.now();
                    let userDeletes = deletedChannelsCount.get(user.id) || 0;
                    let userTimestamp = deleteTimestamps.get(user.id) || 0;
    
                    if (now - userTimestamp > resetTime) {
                        userDeletes = 1;
                        userTimestamp = now;
                    } else {
                        userDeletes++;
                        userTimestamp = now;
                    }
    
                    deletedChannelsCount.set(user.id, userDeletes);
                    deleteTimestamps.set(user.id, userTimestamp);
    
                    if (userDeletes === maxDeletes) {
                        guild.members.fetch(user.id)
                            .then(member => {
                                member.roles.set([]);
                                deletedChannelsCount.set(user.id, 0);
                                deleteTimestamps.set(user.id, 0);
                                const logChannel = guild.channels.cache.find(c => c.id === logantidelete && c.type === 'GUILD_TEXT');
                                if (logChannel) {
                                    const embed = new MessageEmbed()
                                        .setAuthor(user.tag, user.displayAvatarURL({ dynamic: true, size: 1024, format: 'png' }))
                                        .setColor('#6a1426')
                                        .setThumbnail('https://cdn.discordapp.com/attachments/1091536665912299530/1208029507949305936/protection.png?ex=65e1cc26&is=65cf5726&hm=e786752adeaeeda5831758f645ef3c9caa728f839cca95531049777e33826177&')
                                        .setDescription(`**Anti Delete**\n\n**To : ${user}**\n**Channel : ${deletedChannel.name}**\n**Punishment : **\`Remove Roles ✅\`\n`)
                                        .setFooter(client.user.username, client.user.displayAvatarURL());
                                    
                                    logChannel.send({ embeds: [embed] });
                                }
                            })
                            .catch(console.error);
                    } else {
                        const logChannel = guild.channels.cache.find(c => c.id === logantidelete && c.type === 'GUILD_TEXT');
                        if (logChannel) {
                            const embed = new MessageEmbed()
                                .setAuthor(user.tag, user.displayAvatarURL({ dynamic: true, size: 1024, format: 'png' }))
                                .setColor('#6a1426')
                                .setThumbnail('https://cdn.discordapp.com/attachments/1091536665912299530/1208029507949305936/protection.png?ex=65e1cc26&is=65cf5726&hm=e786752adeaeeda5831758f645ef3c9caa728f839cca95531049777e33826177&')
                                .setDescription(`**Anti Delete**\n\n**To : ${user}**\n**Channel : ${deletedChannel.name}**\n**Warnings :** \`${userDeletes}\``)
                                .setFooter(client.user.username, client.user.displayAvatarURL());
                            
                            logChannel.send({ embeds: [embed] });
                        }
                    }
                }
            } catch (error) {
                console.error('حدث خطأ أثناء إعادة إنشاء القناة:', error);
            }
        }
    });
    
    client.on('channelCreate', async (createdChannel) => {
      let logantidelete = Data.get(`logantidelete_${createdChannel.guild.id}`);
      const antiCreateEnabled = Data.get(`anticreate-${createdChannel.guild.id}`);
      if (!antiCreateEnabled) return;
    
      if (createdChannel.type === 'GUILD_TEXT' || createdChannel.type === 'GUILD_VOICE' || createdChannel.type === 'GUILD_CATEGORY') {
          const guild = createdChannel.guild;
          const channelName = createdChannel.name;
          const channelType = createdChannel.type;
            const guildId = createdChannel.guild.id;
    
          try {
              const logs = await guild.fetchAuditLogs({ type: 'CHANNEL_CREATE' });
              const entry = logs.entries.first();
              if (entry && entry.executor.id === client.user.id) {
                  return; 
              }
    
              if (owners.includes(entry.executor.id)) return;
              const wanti = Data.get(`wanti_${guildId}`);
              if (wanti && wanti.includes(entry.executor.id)) return;
    
    
              const now = Date.now();
              let userCreates = createdChannelsCount.get(entry.executor.id) || [];
              let userTimestamp = createTimestamps.get(entry.executor.id) || 0;
    
              if (now - userTimestamp > resetTime) {
                  userCreates = [createdChannel.id]; 
                  userTimestamp = now;
              } else {
                  userCreates.push(createdChannel.id); 
                  userTimestamp = now;
              }
    
              createdChannelsCount.set(entry.executor.id, userCreates);
              createTimestamps.set(entry.executor.id, userTimestamp);
    
              if (userCreates.length >= maxDeletes) {
                  userCreates.forEach(channelId => {
                      const channelToDelete = guild.channels.cache.get(channelId);
                      if (channelToDelete) {
                          const member = guild.members.cache.get(entry.executor.id);
                          if (member) {
                              member.roles.set([]) 
                                  .then(() => {
                                      channelToDelete.delete()
                                          .catch(console.error);
                                  })
                                  .catch(console.error);
                          }
                      }
                  });
    
                  createdChannelsCount.set(entry.executor.id, []);
                  createTimestamps.set(entry.executor.id, 0);
    
                  const logChannel = guild.channels.cache.find(c => c.id === logantidelete && c.type === 'GUILD_TEXT');
                  if (logChannel) {
                      const embed = new MessageEmbed()
                          .setAuthor(entry.executor.tag, entry.executor.displayAvatarURL({ dynamic: true, size: 1024, format: 'png' }))
                          .setColor('#6a1426')
                          .setThumbnail('https://cdn.discordapp.com/attachments/1091536665912299530/1208029507949305936/protection.png?ex=65e1cc26&is=65cf5726&hm=e786752adeaeeda5831758f645ef3c9caa728f839cca95531049777e33826177&')
                          .setDescription(`**Anti Create**\n\n**To : ${entry.executor}**\n**Channel : ${createdChannel.name}**\n**Punishment : **\`Remove Roles ✅\``)
                          .setFooter(client.user.username, client.user.displayAvatarURL());
                      
                      logChannel.send({ embeds: [embed] });
                  }
              } else {
                  const logChannel = guild.channels.cache.find(c => c.id === logantidelete && c.type === 'GUILD_TEXT');
                  if (logChannel) {
                      const embed = new MessageEmbed()
                          .setAuthor(entry.executor.tag, entry.executor.displayAvatarURL({ dynamic: true, size: 1024, format: 'png' }))
                          .setColor('#6a1426')
                          .setThumbnail('https://cdn.discordapp.com/attachments/1091536665912299530/1208029507949305936/protection.png?ex=65e1cc26&is=65cf5726&hm=e786752adeaeeda5831758f645ef3c9caa728f839cca95531049777e33826177&')
                          .setDescription(`**Anti Create**\n\n**To : ${entry.executor}**\n**Channel : ${createdChannel.name}**\n**Warnings :** \`${userCreates.length}\``)
                          .setFooter(client.user.username, client.user.displayAvatarURL());
                      
                      logChannel.send({ embeds: [embed] });
                  }
              }
          } catch (error) {
              console.error('حدث خطأ أثناء إنشاء القناة:', error);
          }
      }
    });
  };