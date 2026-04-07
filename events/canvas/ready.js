const { MessageAttachment, MessageSelectMenu } = require("discord.js");
const { createCanvas, loadImage } = require("canvas");
const db = require("pro.db");

module.exports = async (client) => {
    const interval = 50000;

    client.on('ready', async () => {
        // --- Colors Function ---
        setInterval(async () => {
            try {
                const url = db.get(`Url = [ Colors ]`);
                const channelId = db.get("Channel = [ Colors ]");
                if (!channelId) return;

                const channel = client.channels.cache.get(channelId);
                if (!channel) return;

                const colorRoles = channel.guild.roles.cache.filter(
                    (role) => !isNaN(role.name) && !role.name.includes(".")
                );
                const sortedRoles = colorRoles.sort((roleA, roleB) => roleB.position - roleA.position);

                let canvasHeight = sortedRoles.size > 22 ? 400 : 400;
                const canvas = createCanvas(1200, canvasHeight);
                const ctx = canvas.getContext("2d");

                if (url) {
                    try {
                        const backgroundImage = await loadImage(url);
                        ctx.drawImage(backgroundImage, (canvas.width - backgroundImage.width) / 2, (canvas.height - backgroundImage.height) / 2);
                    } catch (e) { console.error(e); }
                }

                let x = 16, y = (canvasHeight / 2) - 55;
                sortedRoles.forEach((role, index) => {
                    x += 9;
                    if (index >= 22 && index < 25) x += 90;
                    if (x > 1080) { x = 110; y += 90; }

                    ctx.fillStyle = role.hexColor;
                    ctx.strokeStyle = "black";
                    ctx.lineWidth = 5;

                    const radius = 17;
                    ctx.beginPath();
                    ctx.moveTo(x + radius, y);
                    ctx.lineTo(x + 70 - radius, y);
                    ctx.quadraticCurveTo(x + 70, y, x + 70, y + radius);
                    ctx.lineTo(x + 70, y + 70 - radius);
                    ctx.quadraticCurveTo(x + 70, y + 70, x + 70 - radius, y + 70);
                    ctx.lineTo(x + radius, y + 70);
                    ctx.quadraticCurveTo(x, y + 70, x, y + 70 - radius);
                    ctx.lineTo(x, y + radius);
                    ctx.quadraticCurveTo(x, y, x + radius, y);
                    ctx.closePath();
                    ctx.stroke();
                    ctx.fill();

                    ctx.font = "40px Arial";
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.strokeStyle = "black";
                    ctx.lineWidth = 3;
                    ctx.strokeText(role.name, x + 35, y + 35);
                    ctx.fillStyle = "#ffffff";
                    ctx.fillText(role.name, x + 35, y + 35);
                });

                const selectMenu = new MessageSelectMenu()
                    .setCustomId("Colors")
                    .setPlaceholder("قم باختيار اللون المناسب .")
                    .addOptions(sortedRoles.map(r => ({ label: r.name, value: r.id, emoji: '🎨' })));

                await channel.bulkDelete(100).catch(() => null);
                const msg = await channel.send({
                    files: [new MessageAttachment(canvas.toBuffer(), "colors.png")],
                    components: [{ type: 1, components: [selectMenu] }]
                });

                const collector = msg.createMessageComponentCollector({ componentType: "SELECT_MENU" });
                collector.on("collect", async (i) => {
                    const role = i.guild.roles.cache.get(i.values[0]);
                    if (!role) return;
                    const oldRoles = i.member.roles.cache.filter(r => !isNaN(r.name) && !r.name.includes("."));
                    await i.member.roles.remove(oldRoles);
                    await i.member.roles.add(role);
                    i.reply({ content: `**تم تغيير اللون بنجاح إلي ${role.name}**`, ephemeral: true });
                });
            } catch (err) { console.error(err); }
        }, interval);

        // --- AvtClear Function ---
        setInterval(async () => {
            try {
                const channelId = db.get("avtclear");
                if (!channelId) return;
                const channel = client.channels.cache.get(channelId);
                if (!channel) return;

                const colorRoles = channel.guild.roles.cache.filter(r => !isNaN(r.name) && !r.name.includes("."));
                const sortedRoles = colorRoles.sort((a, b) => b.position - a.position);

                let h = 330;
                if (sortedRoles.size > 34) h = 600;
                else if (sortedRoles.size > 22) h = 500;
                else if (sortedRoles.size > 11) h = 400;

                const canvas = createCanvas(1200, h);
                const ctx = canvas.getContext("2d");
                const url = db.get(`Url = [ Colors ]`);

                if (url) {
                    try {
                        const bg = await loadImage(url);
                        ctx.drawImage(bg, 0, 0, 1200, 500);
                    } catch { ctx.clearRect(0, 0, 1200, h); }
                }

                let x = 20, y = 145;
                sortedRoles.forEach(role => {
                    x += 90;
                    if (x > 1080) { x = 110; y += 90; }
                    ctx.fillStyle = role.hexColor;
                    ctx.strokeStyle = "black";
                    ctx.lineWidth = 5;
                    const r = 15;
                    ctx.beginPath();
                    ctx.moveTo(x+r,y); ctx.lineTo(x+70-r,y); ctx.quadraticCurveTo(x+70,y,x+70,y+r);
                    ctx.lineTo(x+70,y+70-r); ctx.quadraticCurveTo(x+70,y+70,x+70-r,y+70);
                    ctx.lineTo(x+r,y+70); ctx.quadraticCurveTo(x,y+70,x,y+70-r);
                    ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath();
                    ctx.stroke(); ctx.fill();
                    ctx.font = "40px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
                    ctx.strokeStyle = "black"; ctx.lineWidth = 3; ctx.strokeText(role.name, x+35, y+35);
                    ctx.fillStyle = "#ffffff"; ctx.fillText(role.name, x+35, y+35);
                });

                await channel.bulkDelete(100).catch(() => null);
                await channel.send({ files: [new MessageAttachment(canvas.toBuffer(), "avtclear.png")] });
            } catch (err) { console.error(err); }
        }, interval);

        // --- AvtChatColors Function ---
        setInterval(async () => {
            try {
                const channelId = db.get("avtchatcolors");
                if (!channelId) return;
                const channel = client.channels.cache.get(channelId);
                if (!channel) return;

                await channel.bulkDelete(100).catch(() => null);
                const savedImg = db.get(`savedImageUrl_${channel.guild.id}`);
                if (savedImg) {
                    await channel.send({ files: [new MessageAttachment(savedImg)] });
                }

                const savedText = db.get(`savedText_${channel.guild.id}`);
                const prefix = db.get("prefix") || "!";
                channel.send(savedText || `
\`${prefix}link\` لأرسال رابط سيرفرك
\`${prefix}change\` لتحويل الصورة من ملون إلى رمادي
\`${prefix}edit-image\` لآضافة فلاتر علي الصورة وتعديلها
\`${prefix}banner\` تحصل على بنر أي شخص بواسطة الأيدي 
\`${prefix}avt\` تجيب أفتار شخص بواسطة الأيدي`);
            } catch (err) { console.error(err); }
        }, interval);
    });
};