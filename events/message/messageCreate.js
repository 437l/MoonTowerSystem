const { Client, intents, Collection, MessageEmbed, MessageAttachment, MessageActionRow, MessageButton, MessageSelectMenu, WebhookClient, MessageModal, Role, Modal, TextInputComponent } = require("discord.js");
const { createCanvas, registerFont, canvas, loadImage } = require("canvas")
const { Canvas, loadFont } = require('canvas-constructor/cairo');
const Data = require("pro.db");
const Discord = require('discord.js');
const axios = require('axios');

module.exports = async (client, message) => {
    if (!message.guild || message.author.bot) return;

    const reactData = Data.get(`RoomInfo_${message.channel.id}`);
    if (reactData) {
        const channel = message.guild.channels.cache.get(reactData.Channel_Id);
        if (channel) {
            const emoji1 = reactData.Emoji1_Id || await client.emojis.cache.find(emoji => emoji.id === reactData.Emoji1_Id);
            const emoji2 = reactData.Emoji2_Id || await client.emojis.cache.find(emoji => emoji.id === reactData.Emoji2_Id);
            const emoji3 = reactData.Emoji3_Id || await client.emojis.cache.find(emoji => emoji.id === reactData.Emoji3_Id);
            const emoji4 = reactData.Emoji4_Id || await client.emojis.cache.find(emoji => emoji.id === reactData.Emoji4_Id);
            const emoji5 = reactData.Emoji5_Id || await client.emojis.cache.find(emoji => emoji.id === reactData.Emoji5_Id);
            const emoji6 = reactData.Emoji6_Id || await client.emojis.cache.find(emoji => emoji.id === reactData.Emoji6_Id);

            if (emoji1) await message.react(emoji1);
            if (emoji2) await message.react(emoji2);
            if (emoji3) await message.react(emoji3);
            if (emoji4) await message.react(emoji4);
            if (emoji5) await message.react(emoji5);
            if (emoji6) await message.react(emoji6);
        }
    }

    const Word = Data.get(`Replys_${message.content}`);

if (Word && message.content.startsWith(Word[0].Word)) {
    let replyText = Word[0].Reply;

    let formattedReply = replyText.replace(/\[user\]/g, `<@${message.author.id}>`);

    message.channel.send({ content: formattedReply });
}
    const userId = message.author.id;
    const points = Data.get(`levels-${message.guild.id}`);
    if (points) {
        let usermessageCount = (await Data.fetch(`${userId}_messageCount`)) || 0;
        if (!message.author.bot) {
            usermessageCount++;
            if (usermessageCount % 10 === 0) {
                let userPoints = (await Data.fetch(`${userId}_points`)) || 0;
                await Data.set(`${userId}_points`, userPoints + 1);
                usermessageCount = 0;
            }
        }
        await Data.set(`${userId}_messageCount`, usermessageCount);
    }

    if (!message.author.bot && message.content) {
        const channels = Data.get(`setChannels_${message.guild.id}`) || [];
        if (channels.includes(message.channel.id)) {
            if (message.attachments.size === 0) {
                message.delete().catch(console.error);
            }
        }
    }

    const storedChannels = await Data.get("Channels") || [];
    for (const entry of storedChannels) {
        if (entry.channelID === message.channel.id) {
            if (entry.fontURL) {
                await message.channel.send({ content: entry.fontURL });
            }
        }
    }
    
    loadFont('./Fonts/JF-Flat-Regular.ttf', { family: 'Cairo' });
    
    if (message.channel.id === Data.get(`setevaluation_${message.guild.id}`)) {
        try {
            let imageURL = Data.get(`setImageURL_${message.guild.id}`);
            let textColor = Data.get(`textColor_${message.guild.id}`) || '#ffffff'; // Default color if not set
  
            async function generateCanvas() {
                let content = message.content;
                content = content.replace(/<@!?\d+>/g, '');
                let contentArr = [];
                while (content.length > 75) {
                    contentArr.push(content.slice(0, 75));
                    content = content.slice(75);
                }
                contentArr.push(content);
                const canvas = new Canvas(914, 316)
                    .printImage(await loadImage(imageURL), 0, 0, 914, 316)
                    .printCircularImage(await loadImage((message.author.avatarURL() + ``).replace(`.webp`, `.png`).replace(`.gif`, `.png`)), 755.80, 258, 35.80, 35.80)
                    .setTextAlign(`right`)
                    .setColor(textColor) 
                    .setShadowColor('rgba(0,0,0,0.5)') 
                    .setShadowBlur(8) 
                    .setTextFont('bold 20px Cairo')
                    .printText(contentArr.join('\n'), 770, 125)
                    .setColor(textColor) 
                    .setTextAlign(`right`)
                    .setTextFont('bold 30px Cairo')
                    .printText(message.member.displayName, 710, 270)
                    .toBuffer();
                return canvas;
            }
  
            let balancCanvas = await generateCanvas();
            await message.channel.send({ files: [balancCanvas] });
            await message.delete().catch(() => {});
        } catch (error) {
            console.error(error);
            return;
        }
    }
    else {



      const imageStatus = await Data.get(`ImageStatus_${message.guild.id}`) || "on"; 
      let image = null; 
      image = Data.get("Line");
      const ChannelData = Data.get(`avtchats-[${message.guild.id}]`);
      const Color = await Data.get(`Guild_Color-${message.guild.id}`) || '#1e1f22';
      
      if (!Color || !ChannelData || message.author.bot || !ChannelData.includes(message.channel.id)) {
          return;
      }
      
      let imageUrls = [];
      let isImage = false;
      let isVideo = false;
      
      if (message.attachments.size > 0) {
          message.attachments.forEach(attachment => {
              const imageUrl = attachment.url;
              const isImageAttachment = attachment.contentType.startsWith('image/');
              const isVideoAttachment = attachment.contentType.startsWith('video/');
      
              if (isImageAttachment || isVideoAttachment) {
                  imageUrls.push({ url: imageUrl, isImage: isImageAttachment, isVideo: isVideoAttachment });
              }
          });
      }
      
      const content = message.content.trim();
      if (content.startsWith('http') && (content.endsWith('.png') || content.endsWith('.jpg') || content.endsWith('.gif'))) {
          imageUrls.push({ url: content, isImage: true, isVideo: false });
      }
      
      if (imageUrls.length === 0) {
          return;
      }
      
      for (const imageUrlData of imageUrls) {
          const { url, isImage, isVideo } = imageUrlData;
      
          const response = await axios.get(url, { responseType: 'arraybuffer' });
          const imageBuffer = Buffer.from(response.data, 'binary');
      
          const row = new MessageActionRow()
              .addComponents(
                  new MessageButton()
                      .setLabel('تحميل')
                      .setStyle('LINK')
                      .setURL(url)
              );
      
          const embed = new MessageEmbed()
              .setColor(Color)
              .setImage('attachment://image.png');
      
          if (image && imageStatus === "on") {
              await message.channel.send({
                  embeds: [embed],
                  files: [{
                      attachment: imageBuffer,
                      name: 'image.png'
                  }],
                  components: [row]
              });
          } else {
              await message.channel.send({
                  files: [{
                      attachment: imageBuffer,
                      name: 'image.png'
                  }],
                  components: [row]
              });
          }
      }
      if (image) {
          await message.channel.send({ files: [image] });
      }
      
      await message.delete();
          }

     if (!message.member.permissions.has('ADMINISTRATOR'))return;
     if (message.content.startsWith("خط")|| message.content.startsWith("line")){
          let image =  Data.get("Line");
          message.channel.send({ content: image }).then(() => {
        message.delete();
});
}
}
