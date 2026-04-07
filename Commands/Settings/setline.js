const dyb = require("pro.db");
const { owners } = require(`${process.cwd()}/config`);
module.exports = {
  name: "setline",
  description: "To set image room",
  usage: "!set-image <image>",
  run: async (client, message, args) => {
    
    const Pro = require(`pro.db`);
    const db = Pro.get(`Allow - Command setline = [ ${message.guild.id} ]`);
    const allowedRole = message.guild.roles.cache.get(db);
    const isAuthorAllowed = message.member.roles.cache.has(allowedRole?.id);
    const isOwner = owners.includes(message.author.id);

    if (!isAuthorAllowed && message.author.id !== db && !isOwner) {
      return message.react(`❌`);
    }

    const imageUrl = args[0];
    if (!imageUrl && !message.attachments.first()) {
      return message.reply({ content: `**يرجى إرفاق رابط الخط أو رفع صورة.**` });
    }

    let image;
    if (imageUrl) {
      const validUrl = require('valid-url');
      if (!validUrl.isUri(imageUrl)) {
        return message.reply('Invalid URL provided!');
      }
      image = imageUrl;
    } else {
      const attachment = message.attachments.first();
      image = attachment.url;
    }

    dyb.set(`Line`, image);
    message.channel.send({ content: `✅ \n${image}` })
      .catch(err => console.log(err));
  }
};
