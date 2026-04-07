 const db = require("pro.db");
 
 module.exports = async (client, role) => {
    const recreatedRolesInfo = new Map();
      const recreatedRolesCount = new Map();
      const deletedRolesInfo = new Map();
      const deletedRolesCount = new Map();
      
      const recreateRole = async (guild, roleInfo) => {
        try {
            const { name, color, permissions } = roleInfo;
            const createdRole = await guild.roles.create({
                name: name,
                color: color,
                permissions: permissions, 
                reason: 'Recreating deleted role with saved data'
            });
            return createdRole;
        } catch (error) {
            console.error('Error recreating role:', error);
        }
    };
    
      client.on('roleCreate', async (createdRole) => {
          const antiRoleCreateEnabled = Data.get(`anticreate-${createdRole.guild.id}`);
          if (!antiRoleCreateEnabled) return;
      
          const guild = createdRole.guild;
          const roleId = createdRole.id;
          const guildId = createdRole.guild.id;
    
          recreatedRolesInfo.set(roleId, { name: createdRole.name, color: createdRole.color });
      
          try {
              const logs = await guild.fetchAuditLogs({ type: 'ROLE_CREATE' });
              const entry = logs.entries.first();
      
              if (!entry || entry.target.id !== createdRole.id) return;
      
              const user = entry.executor;
      
              if (user.id === client.user.id) return;
      
    
              if (owners.includes(entry.executor.id)) return;
              const wanti = Data.get(`wanti_${guildId}`);
              if (wanti && wanti.includes(entry.executor.id)) return;
    
              
              let userCreates = recreatedRolesCount.get(user.id) || 0;
      
              let punishment;
              if (userCreates >= 2) {
                  punishment = 'All roles removed ❌';
                  guild.members.fetch(user.id)
                      .then(member => {
                          member.roles.set([]);
                      })
                      .catch(console.error);
              } else {
                  punishment = `Warnings: ${userCreates + 1}`;
              }
      
              const logChannelId = Data.get(`logantidelete_${guild.id}`);
              const logChannel = guild.channels.cache.get(logChannelId);
      
              if (logChannel) {
                  const embed = new MessageEmbed()
                      .setAuthor(user.tag, user.displayAvatarURL({ dynamic: true, size: 1024, format: 'png' }))
                      .setColor('#6a1426')
                      .setThumbnail('https://cdn.discordapp.com/attachments/1091536665912299530/1208029507949305936/protection.png?ex=65e1cc26&is=65cf5726&hm=e786752adeaeeda5831758f645ef3c9caa728f839cca95531049777e33826177&')
                      .setDescription(`**Anti Role Create**\n\n**User:** ${user}\n**Created Role:** ${createdRole.name}\n**Punishment:** \`${punishment}\``)
                      .setFooter(client.user.username, client.user.displayAvatarURL());
      
                  logChannel.send({ embeds: [embed] });
              }
      
              recreatedRolesCount.set(user.id, userCreates + 1);
      
              await createdRole.delete('Deleted by anti-role-create feature');
          } catch (error) {
              console.error('Error handling role creation event:', error);
          }
      });
    
      client.on('roleDelete', async (deletedRole) => {
    
        const antiRoleDeleteEnabled = Data.get(`antiDelete-${deletedRole.guild.id}`);
        if (!antiRoleDeleteEnabled) return; 
    
        const guild = deletedRole.guild;
        const roleId = deletedRole.id;
        const guildId = deletedRole.guild.id;
    
        deletedRolesInfo.set(roleId, { name: deletedRole.name, color: deletedRole.color });
    
        try {
            const logs = await guild.fetchAuditLogs({ type: 'ROLE_DELETE' });
            const entry = logs.entries.first();
    
    
            if (!entry || entry.target.id !== deletedRole.id) return;
    
            const user = entry.executor;
    
           if (user.id === client.user.id) return;
    
              if (owners.includes(entry.executor.id)) return;
              const wanti = Data.get(`wanti_${guildId}`);
              if (wanti && wanti.includes(entry.executor.id)) return;
    
            let userDeletes = deletedRolesCount.get(user.id) || 0;
    
            let punishment;
            if (userDeletes >= 2) {
                punishment = 'All roles removed ❌';
                guild.members.fetch(user.id)
                    .then(member => {
                        member.roles.set([]);
                    })
                    .catch(console.error);
            } else {
                punishment = `Warnings: ${userDeletes + 1}`;
            }
    
            const logChannelId = Data.get(`logantidelete_${guild.id}`);
            const logChannel = guild.channels.cache.get(logChannelId);
    
            if (logChannel) {
                const embed = new MessageEmbed()
                    .setAuthor(user.tag, user.displayAvatarURL({ dynamic: true, size: 1024, format: 'png' }))
                    .setColor('#6a1426')
                    .setThumbnail('https://cdn.discordapp.com/attachments/1091536665912299530/1208029507949305936/protection.png?ex=65e1cc26&is=65cf5726&hm=e786752adeaeeda5831758f645ef3c9caa728f839cca95531049777e33826177&')
                    .setDescription(`**Anti Role Delete**\n\n**User:** ${user}\n**Deleted Role:** ${deletedRole.name}\n**Punishment:** \`${punishment}\``)
                    .setFooter(client.user.username, client.user.displayAvatarURL());
    
                logChannel.send({ embeds: [embed] });
            }
    
            deletedRolesCount.set(user.id, userDeletes + 1);
            const roleInfo = deletedRolesInfo.get(deletedRole.id);
            if (roleInfo) {
                const recreatedRole = await recreateRole(guild, roleInfo);
            }
        } catch (error) {
            console.error('حدث خطأ أثناء معالجة حدث حذف الرول:', error);
        }
      });
 };