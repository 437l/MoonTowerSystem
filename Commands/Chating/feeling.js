const { MessageAttachment } = require("discord.js");
const { createCanvas, loadImage, registerFont } = require("canvas");
const Data = require("pro.db");
const path = require("path");

module.exports = async (client, message) => {
    if (!message.guild || message.author.bot) return;

    const fillingChannelId = Data.get(`filling_channel_${message.guild.id}`);
    if (message.channel.id !== fillingChannelId) return;

    try {
        await message.delete().catch(() => {});
        const canvas = createCanvas(1000, 300);
        const ctx = canvas.getContext("2d");

        ctx.fillStyle = "#1a1b1e"; 
        ctx.roundRect = function (x, y, w, h, r) {
            if (w < 2 * r) r = w / 2;
            if (h < 2 * r) r = h / 2;
            this.beginPath();
            this.moveTo(x + r, y);
            this.arcTo(x + w, y, x + w, y + h, r);
            this.arcTo(x + w, y + h, x, y + h, r);
            this.arcTo(x, y + h, x, y, r);
            this.arcTo(x, y, x + w, y, r);
            this.closePath();
            return this;
        };
        ctx.roundRect(10, 10, 980, 280, 20).fill();

        const avatar = await loadImage(message.author.displayAvatarURL({ format: "png", size: 256 }));
        ctx.save();
        ctx.beginPath();
        ctx.arc(100, 150, 60, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, 40, 90, 120, 120);
        ctx.restore();

        ctx.font = "bold 35px Arial"; 
        ctx.fillStyle = "#ffffff";
        ctx.fillText(message.member.displayName, 180, 100);

        ctx.font = "30px Arial";
        ctx.fillStyle = "#d1d1d1";

        let words = message.content.split(' ');
        let line = '';
        let y = 160;
        for(let n = 0; n < words.length; n++) {
            let testLine = line + words[n] + ' ';
            if (ctx.measureText(testLine).width > 750 && n > 0) {
                ctx.fillText(line, 180, y);
                line = words[n] + ' ';
                y += 40;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, 180, y);

        const attachment = new MessageAttachment(canvas.toBuffer(), "feeling.png");
        await message.channel.send({ files: [attachment] });


        
        const linePath = Data.get(`filling_line_${message.guild.id}`);
if (linePath) {
    await message.channel.send({ 
        files: [{ attachment: linePath, name: "line.png" }] 
    });
}

    } catch (error) {
        console.error("Filling System Error:", error);
    }
};