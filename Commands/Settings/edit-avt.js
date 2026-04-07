const { MessageActionRow, MessageSelectMenu, MessageButton, Permissions } = require("discord.js");
const { owners } = require(`${process.cwd()}/config`);
const Pro = require('pro.db');
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "edit-avt",
  description: "Edit avatar commands",
  run: async (client, message, args) => {

    if (!owners.includes(message.author.id)) return message.react('❌');
    const isEnabled = Pro.get(`command_enabled_${module.exports.name}`);
    if (isEnabled === false) {
        return; 
    }

    const selectMenu = new MessageActionRow()
      .addComponents(
        new MessageSelectMenu()
          .setCustomId('vipMenu')
          .setPlaceholder('اختر إحدى الخيارات')
          .addOptions([
            {
              label: 'نشر الروابط',
              description: '🔗 انشاء شاتات نشر الروابط',
              value: 'sharing',
            },{
              label: 'حذف شاتات',
              description: '🔗 حذف شاتات نشر الروابط',
              value: 'sharingdel',
            },{
              label: 'تعين شاتات',
              description: '🖼️ تعين شاتات نشر صور الافتارت',
              value: 'avtchannels',
            },{
              label: 'حذف شاتات',
              description: '🖼️ حذف جميع شاتات نشر صور الافتارت',
              value: 'avtdelete',
            },{
              label: 'عرض القائمة',
              description: '🖼️ عرض قائمة شاتات صور الآفتارت المحفوظه',
              value: 'showavtchannels',
            },{
              label: 'تحديد الخط',
              description: '🖼️ إضافه/حذف الخط المروبط مع شاتات نشر الصور',
              value: 'avtline',
            },{
                label: 'تفعيل/إلغاء',
                description: '🖼️ تفعيل أو إلغاء الامبيد بالصور',
                value: 'toggleFeature',
            },{
              label: 'تحديد شات',
              description: '💬 تحديد شات المسح التلقائي',
              value: 'avtchannelcolors',
            },{
                label: 'تعديل رسالة',
                description: '💬 تعديل رسالة المسح التلقائي',
                value: 'savedText',
              },{
                label: 'تعديل صورة',
                description: '💬  إضافه/حذف صورة بدال صورة الآلوان للمسح التلقائي',
                value: 'savedImageUrl',
              }
          ])
      );

    const deleteButton = new MessageButton()
      .setCustomId('Cancel')
      .setLabel('إلغاء')
      .setStyle('DANGER');

    const Cancel = new MessageActionRow()
      .addComponents(deleteButton);

    message.reply({ content:"**قائمة آوامر تعديل الافتارت**.",  components: [selectMenu, Cancel] });

    const filter = (interaction) => interaction.user.id === message.author.id;
    const collector = message.channel.createMessageComponentCollector({ filter, time: 60000 });

    collector.on("collect", async (interaction) => {
      if (!interaction.values || interaction.values.length === 0) return;
      collector.stop();
    
      const choice = interaction.values[0];
    
      if (choice === "sharing") {
        await interaction.message.delete();
            const category = await message.guild.channels.create('Link:', {
                type: 'GUILD_CATEGORY',
                permissionOverwrites: [
                    {
                        id: message.guild.id,
                        deny: [Permissions.FLAGS.SEND_MESSAGES],
                      },
                ],
            });
    
            const serverRoom = await message.guild.channels.create('serv', {
                type: 'GUILD_TEXT',
                parent: category.id,
            });
    
            const avatarRoom = await message.guild.channels.create('avvt', {
                type: 'GUILD_TEXT',
                parent: category.id,
            });
    
            const shopRoom = await message.guild.channels.create('shop', {
                type: 'GUILD_TEXT',
                parent: category.id,
            });
    
            // حفظ معرفات القنوات في قاعدة البيانات
            Pro.set(`server_${message.guild.id}`, serverRoom.id);
            Pro.set(`avatar_${message.guild.id}`, avatarRoom.id);
            Pro.set(`shop_${message.guild.id}`, shopRoom.id);
    
          await  message.reply('**تم إنشاء شاتات نشر الروابط بنجاح** ✅');
        
    } if (choice === "sharingdel") {
      await interaction.message.delete();
      const dbServerChannel = Pro.get(`server_${message.guild.id}`);
      const dbAvatarChannel = Pro.get(`avatar_${message.guild.id}`);
      const dbShopChannel = Pro.get(`shop_${message.guild.id}`);

        if (dbServerChannel) {
          const serverChannel = await message.guild.channels.cache.get(dbServerChannel);
          if (serverChannel) await serverChannel.delete();
        }
  
        if (dbAvatarChannel) {
          const avatarChannel = await message.guild.channels.cache.get(dbAvatarChannel);
          if (avatarChannel) await avatarChannel.delete();
        }
  
        if (dbShopChannel) {
          const shopChannel = await message.guild.channels.cache.get(dbShopChannel);
          if (shopChannel) await shopChannel.delete();
        }
  
        // إزالة البيانات من قاعدة البيانات
        Pro.delete(`server_${message.guild.id}`);
        Pro.delete(`avatar_${message.guild.id}`);
        Pro.delete(`shop_${message.guild.id}`);
  
        await  message.reply('**تم حذف شاتات نشر الروابط بنجاح** ✅');
      

    } if (choice === 'avtchannels') {
      // حذف الرسالة التي يحتوي عليها الأمر من الشات
      await interaction.message.delete();
  
      let selectedChannels = [];
  
      if (args.length > 0) {
          args.forEach(arg => {
              // إذا كان الإدخال عبارة عن منشن لقناة أو الايدي المراد استخدامه
              const channel = message.mentions.channels.get(arg) || message.guild.channels.cache.get(arg);
              if (channel) {
                  selectedChannels.push(channel.id);
              }
          });
      }
  
      if (selectedChannels.length === 0) {
          // إذا لم يتم تحديد قناة
          const requestMessage = await message.reply("**يرجى إرفاق منشن الشات أو الأيدي** ⚙️");
          const filter = m => m.author.id === message.author.id;
          const collector = message.channel.createMessageCollector({ filter, time: 30000 });
  
          collector.on('collect', async (msg) => {
              const mentionedChannels = msg.mentions.channels;
              mentionedChannels.forEach(channel => {
                  if (!selectedChannels.includes(channel.id)) {
                      selectedChannels.push(channel.id);
                  }
              });
  
              const channelIds = msg.content.match(/(?:<#(\d+)>|(\d+))/g);
              if (channelIds) {
                  channelIds.forEach(id => {
                      const channelId = id.replace(/<#|>/g, '');
                      if (!selectedChannels.includes(channelId)) {
                          selectedChannels.push(channelId);
                      }
                  });
              }
  
              collector.stop();
          });
  
          collector.on('end', () => {
              if (selectedChannels.length === 0) {
                  // إذا لم يتم تحديد قناة في الوقت المناسب
                  requestMessage.edit("**أنتهى وقت التعديل** ❌");
              } else {
                  // حفظ القنوات المحددة
                  selectedChannels.forEach(channelId => {
                      Pro.push(`avtchats-[${message.guild.id}]`, channelId);
                  });
                  requestMessage.edit("**تم حفظ الشات بنجاح.** ✅");
              }
          });
      } else {
          // حفظ القنوات المحددة
          selectedChannels.forEach(channelId => {
              if (!Pro.includes(`avtchats-[${message.guild.id}]`, channelId)) {
                  Pro.push(`avtchats-[${message.guild.id}]`, channelId);
              }
          });
          message.reply("**تم حفظ الشات بنجاح.** ✅");
      }
  

  }  if (choice === 'showavtchannels') {
    await interaction.message.delete();
    const savedChannels = await Pro.get(`avtchats-[${message.guild.id}]`);
    if (!savedChannels || savedChannels.length === 0) {
        message.reply("**لا يوجد شاتات محفوظة.** ❌");
    } else {
        const totalPages = Math.ceil(savedChannels.length / 10); // تحديد عدد الصفحات

        let page = 1;
        const sendList = (page) => {
            const start = (page - 1) * 10;
            const end = page * 10;
            let channelsList = "قائمة شاتات الافتارت المحفوظة:\n";
            savedChannels.slice(start, end).forEach((channelId, index) => {
                const channel = message.guild.channels.cache.get(channelId);
                if (channel) {
                    channelsList += `\`#${index + start + 1}\` <#${channel.id}> (${channel.id})\n`;
                }
            });
            
            // إنشاء الأزرار
            const row = createButtons();
            return { content: channelsList, components: [row] };
        };

        const messageToSend = await message.channel.send(sendList(page));

        const filter = i => i.user.id === message.author.id;
        const collector = messageToSend.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async i => {
            if (i.customId === 'previous') {
                page = Math.max(1, page - 1);
            } else if (i.customId === 'next') {
                page = Math.min(totalPages, page + 1);
            }

            await i.update(sendList(page));
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                messageToSend.edit(sendList(page));
            }
        });

        function createButtons() {
            const previousButton = new MessageButton()
                .setCustomId('previous')
                .setEmoji("⬅️")
                .setStyle('PRIMARY');

            const nextButton = new MessageButton()
                .setCustomId('next')
                .setEmoji("➡️")
                .setStyle('PRIMARY');

            const row = new MessageActionRow()
                .addComponents(previousButton, nextButton);

            if (totalPages <= 1) {
                row.components.forEach(component => component.setDisabled(true));
            }

            return row;
        }
    }

} if (choice === "avtdelete") {
  // حذف الرسالة التي يحتوي عليها الأمر من الشات
  await interaction.message.delete();

  const savedChannels = await Pro.get(`avtchats-[${message.guild.id}]`);

  if (!savedChannels || savedChannels.length === 0) {
    return message.reply("**لا يوجد شاتات محفوظة لحذفها.** ❌");
  }

  // حذف القنوات المحفوظة من قاعدة البيانات
  Pro.delete(`avtchats-[${message.guild.id}]`);

  return message.reply("**تم حذف شاتات الافتارت من بنجاح.** ✅");
} if (choice === "avtline") {
    await interaction.message.delete(); 

    // التحقق من وجود خط محفوظ
    const existingLine = Pro.get(`Line`);
    if (existingLine) {
        Pro.delete(`Line`);
        await message.reply('**تم حذف الخط السابق بنجاح.** ✅');
        // تجاهل عملية تحديد الخط
        return;
    }

    if (message.author.bot) return;

    let imageURL;

    if (args[0]) {
        imageURL = args[0];
    } else if (message.attachments.size > 0) {
        imageURL = message.attachments.first().url;
    } else {
        return message.reply("**يرجى أرفاق رابط الخط او الخط.** ⚙️").then(sentMessage => {
            const filter = m => m.author.id === message.author.id;
            const collector = message.channel.createMessageCollector({ filter, time: 60000 });

            collector.on('collect', async (msg) => {
                if (msg.attachments.size > 0) {
                    imageURL = msg.attachments.first().url;
                    await saveLine(imageURL);
                    message.react('✅');
                    sentMessage.edit("**تم حفظ الخط بنجاح. ✅**");
                    await msg.delete().catch(console.error); // حذف الصورة من الشات بعد حفظها
                    collector.stop();
                } else {
                    msg.reply("**يرجى أرفاق رابط الخط او الخط.** ⚙️");
                }
            });

            collector.on('end', () => {
                if (!imageURL) {
                    sentMessage.edit("**أنتهى وقت التعديل** ❌");
                }
            });
        });
    }

    await saveLine(imageURL);


    async function saveLine(imageUrl) {
        const imageName = "line.png"; // اسم الصورة الناتجة
        const imagePath = path.join(process.cwd(), "Fonts", imageName);
    
        // Download the image
        const response = await fetch(imageUrl);
        const buffer = await response.buffer();
    
        // Save the image to the specified directory
        fs.writeFileSync(imagePath, buffer);
    
        Pro.set(`Line`, imagePath);
    }

} if (choice === "avtchannelcolors") {
  // حذف الرسالة التي يحتوي عليها الأمر من الشات
  await interaction.message.delete();

 
    
    let selectedChannelID;
    
    if (args[0]) {
        // إذا كان الإدخال عبارة عن ايدي للشات
        const channelID = args[0].replace(/\D/g, ''); // استخراج الأرقام فقط من النص
        if (message.guild.channels.cache.has(channelID)) {
            selectedChannelID = channelID;
        }
    }
    
    if (!selectedChannelID) {
        // إذا لم يتم تحديد قناة باستخدام الايدي، قم بالبحث عن منشن الشات في الرسالة
        const channelMention = message.mentions.channels.first();
        if (channelMention) {
            selectedChannelID = channelMention.id;
        } else {
            const requestMessage = await message.reply("**يرجى ارفاق منشن الشات او الايدي .** ⚙️");
            const filter = m => m.author.id === message.author.id;
            const collector = message.channel.createMessageCollector({ filter, time: 30000 });
            
            collector.on('collect', async (msg) => {
                const channel = msg.mentions.channels.first();
                if (channel) {
                    selectedChannelID = channel.id;
                    collector.stop();
                } else {
                    // يتم تحديد الإدخال كايدي للشات
                    const channelID = msg.content.replace(/\D/g, '');
                    if (message.guild.channels.cache.has(channelID)) {
                        selectedChannelID = channelID;
                        collector.stop();
                    } else {
                        msg.reply("**يرجى ارفاق منشن الشات او الايدي .**⚙️");
                    }
                }
            });
            
            collector.on('end', () => {
                if (!selectedChannelID) {
                    // إذا لم يتم تحديد قناة في الوقت المناسب
                    requestMessage.edit("**أنتهى وقت التعديل** ❌");
                } else {
                    // حفظ القناة المحددة
                    Pro.set(`avtchatcolors`, selectedChannelID);
                    requestMessage.edit("**تم حفظ القناة بنجاح.** ✅");
                }
            });
        }
    } else {
        Pro.set(`avtchatcolors`, selectedChannelID);

        message.reply("**تم حفظ القناة بنجاح.** ✅");
    }

}   if (choice === "savedText") {
    await interaction.message.delete();
      
        let selectedContent;
    
        if (args[0]) {
            selectedContent = args.join(" ");
        }
    
        if (!selectedContent) {
            const requestMessage = await message.reply("**يرجى ارفاق رسالة علبه الالوان الجديدة .**⚙️");
            const filter = m => m.author.id === message.author.id;
            const collector = message.channel.createMessageCollector({ filter, time: 30000 });
    
            collector.on('collect', async (msg) => {
                selectedContent = msg.content;
                collector.stop();
            });
    
            collector.on('end', () => {
                if (!selectedContent) {
                    requestMessage.edit("**أنتهى وقت التعديل** ❌");
                } else {
                    Pro.set(`savedText_${message.guild.id}`, selectedContent);
                    requestMessage.edit("**تم حفظ النص بنجاح.** ✅");
                }
            });
        } else {
            Pro.set(`savedText_${message.guild.id}`, selectedContent);
            message.reply("**تم حفظ النص بنجاح.** ✅");
        }

    } if (choice === "savedImageUrl") {
        await interaction.message.delete(); 
        
        const savedImageUrl = Pro.get(`savedImageUrl_${message.guild.id}`);
        if (savedImageUrl) {
            Pro.delete(`savedImageUrl_${message.guild.id}`);
            await message.reply('**تم حذف الصورة السابقة بنجاح.** ✅');
            return;
        }
        
        if (message.author.bot) return;
        
        let imageURL;
        
        if (args[0]) {
            imageURL = args[0];
            await saveImageUrl(message.guild.id, imageURL);
            await message.reply('**تم حفظ الصورة بنجاح.** ✅');
        } else if (message.attachments.size > 0) {
            imageURL = message.attachments.first().url;
            await saveImageUrl(message.guild.id, imageURL);
            await message.reply('**تم حفظ الصورة بنجاح.** ✅');
        } else {
            return message.reply("**يرجى أرفاق رابط الصورة او الصورة.** ⚙️").then(sentMessage => {
                const filter = m => m.author.id === message.author.id;
                const collector = message.channel.createMessageCollector({ filter, time: 60000 });
    
                collector.on('collect', async (msg) => {
                    if (msg.attachments.size > 0) {
                        imageURL = msg.attachments.first().url;
                        await saveImageUrl(message.guild.id, imageURL);
                        message.react('✅');
                        sentMessage.edit("**تم حفظ الصورة بنجاح. ✅**");
                        await msg.delete().catch(console.error); 
                        collector.stop();
                    } else {
                        msg.reply("**يرجى أرفاق الصورة الخط او الصورة.** ⚙️");
                    }
                });
    
                collector.on('end', () => {
                    if (!imageURL) {
                        sentMessage.edit("**أنتهى وقت التعديل** ❌");
                    }
                });
            });
        }
    }
    
    async function saveImageUrl(guildId, imageUrl) {
        const imageName = "imagecolors.png"; // اسم الصورة الناتجة
        const imagePath = path.join(process.cwd(), "Fonts", imageName);
    
        // Download the image
        const response = await fetch(imageUrl);
        const buffer = await response.buffer();
    
        // Save the image to the specified directory
        fs.writeFileSync(imagePath, buffer);
    
        Pro.set(`savedImageUrl_${guildId}`, imagePath);
    }

    
    if (choice === "toggleFeature") {
        await interaction.message.delete();
            let imageStatus = Pro.get(`ImageStatus_${message.guild.id}`) || "on";
            imageStatus = (imageStatus === "off") ? "on" : "off";
    
        Pro.set(`ImageStatus_${message.guild.id}`, imageStatus);
        const statusMessage = (imageStatus === "on") ? "**تم تفعيل عرض الصورة بـ امبيد ✅**" : "**تم تفعيل عرض الصور بدون امبيد ✅**";
        await message.reply(statusMessage);
    }

    
        
    
    
    
    });
    

    client.on('interactionCreate', async (interaction) => {
      if (!interaction.isButton()) return;

      if (interaction.customId === 'Cancel') {
        collector.stop();
        interaction.message.delete();
      }
    });
  },
};
