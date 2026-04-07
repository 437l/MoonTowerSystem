const { MessageActionRow, MessageButton, MessageEmbed, Modal, TextInputComponent } = require("discord.js");
const { createTranscript } = require('discord-html-transcripts');
const db = require("pro.db");

module.exports = async (client) => {
    client.removeAllListeners('interactionCreate'); 

    client.on('interactionCreate', async (interaction) => {
        if (!interaction.guild) return;
        const guildId = interaction.guild.id;
        const Color = db.get(`Guild_Color_${guildId}`) || '#4e464f';

        if (interaction.isSelectMenu() && interaction.customId === 'M0') {
            const Role = db.get(`Role = [${guildId}]`);
            const Cat = db.get(`Cat = [${guildId}]`);

            if (db.get(`member${interaction.user.id}`) === true) {
                return interaction.reply({ content: '**لديك تذكرة مفتوحة بالفعل!**', ephemeral: true });
            }

            await interaction.deferReply({ ephemeral: true });

            const ticketNames = { 'M1': 'support', 'M2': 'apply', 'M3': 'gift' };
            const menuOptions = db.get(`menuOptions_${guildId}`) || [];
            const selectedOption = menuOptions.find(opt => opt.value === interaction.values[0]);
            const reason = selectedOption ? selectedOption.label : 'No Reason Provided';
            const folderName = ticketNames[interaction.values[0]] || 'ticket';

            const Parent = interaction.guild.channels.cache.get(Cat);
            if (!Parent) return interaction.editReply({ content: 'Error: Category Not Found' });

            try {
                const channel = await interaction.guild.channels.create(`${folderName}-${interaction.user.username}`, {
                    type: 'GUILD_TEXT',
                    parent: Parent.id,
                    permissionOverwrites: [
                        { id: interaction.user.id, allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'ATTACH_FILES'] },
                        { id: Role, allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'ATTACH_FILES'] },
                        { id: interaction.guild.roles.everyone, deny: ['VIEW_CHANNEL'] },
                    ],
                });

                db.set(`channel${channel.id}`, interaction.user.id);
                db.set(`member${interaction.user.id}`, true);

                await interaction.editReply({ content: `**تم إنشاء التذكرة بنجاح: ${channel}**` });

                const actionRow = new MessageActionRow().addComponents(
                    new MessageButton().setCustomId('Adding').setStyle('SECONDARY').setEmoji('➕').setLabel('إضافة شخص'),
                    new MessageButton().setCustomId('Delete').setStyle('DANGER').setEmoji('🔒').setLabel('إغلاق التذكرة')
                );

                const embed = new MessageEmbed()
                    .setColor(Color)
                    .setAuthor(interaction.guild.name, interaction.guild.iconURL({ dynamic: true }))
                    .setDescription(`**سبب فتح التذكرة:**\n> ${reason}\n\nيرجى الانتظار حتى يتم الرد عليك من قبل الطاقم الإداري.`)
                    .setTimestamp();

                await channel.send({ content: `<@${interaction.user.id}> - <@&${Role}>`, embeds: [embed], components: [actionRow] });

                const tcsend = db.get(`tcsend_${guildId}`);
                if (tcsend) {
                    setTimeout(() => channel.send(tcsend).catch(() => null), 3000);
                }
            } catch (err) {
                await interaction.editReply({ content: 'حدث خطأ أثناء إنشاء القناة.' });
            }
        }

        if (interaction.isButton()) {
            const staffRole = db.get(`Role = [${guildId}]`);

            if (interaction.customId === "Delete") {
                if (!interaction.member.roles.cache.has(staffRole) && !interaction.member.permissions.has('ADMINISTRATOR')) {
                    return interaction.reply({ content: `**لا تملك صلاحية إغلاق هذه التذكرة.**`, ephemeral: true });
                }

                const logChannelId = db.get(`Channel = [${guildId}]`);
                const logChannel = interaction.guild.channels.cache.get(logChannelId);

                const transcript = await createTranscript(interaction.channel, {
                   minify: true,
                   saveImages: true,
                   useCDN: true,
                   poweredBy: false,
                   fileName: `${interaction.channel.name}.html`,
                   returnType: 'attachment'
                });

                const ownerId = db.get(`channel${interaction.channel.id}`);
                const logEmbed = new MessageEmbed()
                    .setColor(Color)
                    .setAuthor(interaction.user.tag, interaction.user.avatarURL({ dynamic: true }))
                    .setTitle('إغلاق تذكرة')
                    .addField('صاحب التذكرة', ownerId ? `<@${ownerId}>` : 'غير معروف', true)
                    .addField('أغلق بواسطة', `${interaction.user}`, true)
                    .addField('اسم التذكرة', interaction.channel.name, true)
                    .setTimestamp();

                await interaction.reply({ content: `**سيتم حذف التذكرة خلال 5 ثواني...**` });

                if (logChannel) await logChannel.send({ embeds: [logEmbed], files: [transcript] }).catch(() => null);

                setTimeout(async () => {
                    if (ownerId) {
                        db.delete(`member${ownerId}`);
                        db.delete(`channel${interaction.channel.id}`);
                    }
                    await interaction.channel.delete().catch(() => { });
                }, 5000);
            }

            if (interaction.customId === "Adding") {
                if (!interaction.member.roles.cache.has(staffRole) && !interaction.member.permissions.has('ADMINISTRATOR')) {
                    return interaction.reply({ content: `**لا تملك صلاحية إضافة أشخاص.**`, ephemeral: true });
                }

                const modal = new Modal().setCustomId('add_member_modal').setTitle('إضافة شخص للتذكرة');
                const input = new TextInputComponent()
                    .setCustomId('user_id_input')
                    .setLabel('ايدي الشخص (User ID)')
                    .setStyle('SHORT')
                    .setPlaceholder('123456789012345678')
                    .setRequired(true);

                modal.addComponents(new MessageActionRow().addComponents(input));
                await interaction.showModal(modal);
            }
        }

        if (interaction.isModalSubmit()) {
            if (interaction.customId === "add_member_modal") {
                const userId = interaction.fields.getTextInputValue('user_id_input');
                const targetMember = await interaction.guild.members.fetch(userId).catch(() => null);

                if (!targetMember) return interaction.reply({ content: 'تعذر العثور على هذا العضو، تأكد من صحة الايدي.', ephemeral: true });

                await interaction.channel.permissionOverwrites.edit(targetMember, { VIEW_CHANNEL: true, SEND_MESSAGES: true });
                await interaction.reply({ content: `**تم إضافة ${targetMember} إلى التذكرة بنجاح.**`, ephemeral: true });
            }
        }
    });
};