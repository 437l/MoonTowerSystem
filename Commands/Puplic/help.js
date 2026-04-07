const Discord = require("discord.js")
const db = require(`pro.db`)
const { MessageEmbed, MessageButton, MessageActionRow, MessageSelectMenu } = require("discord.js");
const { prefix, hemoji } = require(`${process.cwd()}/config`);
module.exports = {
    name: 'help', // هنا اسم الامر
    run : (client, message, args) => {
      
      const isEnabled = db.get(`command_enabled_${module.exports.name}`);
      if (isEnabled === false) {
          return; 
      }
  

      const Color = db.get(`Guild_Color = ${message.guild.id}`) || '#4e464f';
      if (!Color) return;
      
     
            const button = new MessageButton()
            .setLabel('helps menu')
            .setStyle('LINK')
            .setURL('https://discord.gg/');

            const guild = message.guild;
            const currentDate = new Date();
            const replyembed = new Discord.MessageEmbed()
                .setColor(Color || '#4e464f')
                .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
                .setFooter(`${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`)
            


   
                .setDescription(`**اوامر البوت :
                يمكنك الان عرض قائمة الاوامر المناسبه لك
                عدد ألاوامر : \`150\`
                Prefix : \`${prefix}\`**`)



    const r1ow = new MessageActionRow().addComponents(button);
    const row = new Discord.MessageActionRow()
      .addComponents(
        new Discord.MessageSelectMenu()
          .setCustomId('help')
          .setPlaceholder("آختار ألقائمة المُناسبة لك")
          .addOptions([
            {
              label: 'ألاوامر ألعامة' ,
              value: 'help1',
            },
            {
              label: 'آوامر ا لادارة',
              value: 'help2',
            },            {
              label: 'آوامر الرولات',
              value: 'help3',
            },
            {
              label: 'آوامر  الشاتات',
              value: 'help4',
            },
            {
              label: 'آوامر الحماية',
              value: 'help5',
            },
            {
              label: 'آوامر الاعداد',
              value: 'help6',
            },

            {
              label: 'آوامر ألتذاكر',
              value: 'help7',
            },
            {
              label: 'آوامر السيرفر',
              value: 'help9',
            },
             {
              label: 'حذف القائمة',
              value: 'help10',
            },
            
          ]),

      );


    message.reply({
      embeds: [replyembed], components: [row, r1ow]
    }).catch(console.error).then(message => setTimeout(() => {

      const row = new Discord.MessageActionRow()
        .addComponents(
          new Discord.MessageSelectMenu()
            .setCustomId('help')
            .setPlaceholder("آختار ألقائمة المُناسبة لك")
            .setDisabled(true)
            .addOptions([
             {
              label: 'آلاوامر ألعامة' ,
              value: 'help1',
            },
            {
              label: 'آوامر ا لادارة',
              value: 'help2',
            },
            {
              label: 'آوامر  الشاتات',
              value: 'help4',
            },
            {
              label: 'آوامر الرولات',
              value: 'help3',
            },
            {
              label: 'آوامر الحماية',
              value: 'help5',
            },
            {
              label: 'آوامر الاعداد',
              value: 'help6',
            },
            {
              label: 'آوامر ألتذاكر',
              value: 'help7',
            },
            {
              label: 'آوامر السيرفر.',
              value: 'help9',
            },
             {
              label: 'حذف قائمة المساعدة',
              value: 'help10',
            },

            ]),
        );
      message.edit({ embeds: [replyembed], components: [row, r1ow]})

    }, 2000000)).catch(console.error);

    client.on("interactionCreate", interaction => {
      if (!interaction.isSelectMenu()) return;
      if (interaction.user.id !== message.author.id) return; 
      if (interaction.values == "help1") {
        let replyembed = new Discord.MessageEmbed()
      .setColor(`${Color || `#4e464f`}`)
      .setTitle('ألاوامر ألعامة')
      .setDescription(`
 \`${prefix}help\` : قائمه المساعدة
 \`${prefix}avatar\` : عرض صورة شخص
 \`${prefix}banner\` : عرض بنر شخص
 \`${prefix}user\` : عرض معلومات عضو
 \`${prefix}top\` : عرض توب 8 اشخاص 
 \`${prefix}server\` : عرض معلومات السيرفر
 \`${prefix}myinv\` : عدد دعواتك
 \`${prefix}topinv\` : اعلى عدد دعوات
 \`${prefix}mcolors\` : اختار لونك من القائمة
 \`${prefix}colors\` : علبة الالوان
 \`${prefix}color\` : اختيار لون
 \`${prefix}change\` : اضافة فلتر لصورة
 \`${prefix}circle\` : عرض صورة العضو على شكل دائرة
 \`${prefix}aremove\` : يزيل خلفية الصور
 \`${prefix}semoji\` : أرسال صورة الايموجي
 \`${prefix}edit-image\` : فلاتر وتعديل علي الصور
`)
        interaction.update({ embeds: [replyembed] });
      }
      if (interaction.values == "help2") {
        let replyembed = new Discord.MessageEmbed()
      .setColor(`${Color || `#4e464f`}`)
      .setTitle('ألاوامر ألإدارية')
      .setDescription(`
 \`${prefix}stickers\` : اضافة ستيكرز للسيرفر
 \`${prefix}aemoji\` : اضافة ايموجي للسيرفر
 \`${prefix}mute\` : اسكات كتابي
 \`${prefix}mymute\` : معلومات ميوت العضو
 \`${prefix}unmute\` : الغاء الاسكات الكتابي
 \`${prefix}prison\` : سجن عضو
 \`${prefix}myprison \` : معلومات سجن العضو
 \`${prefix}unprison\` : فك سجن عضو
 \`${prefix}unvmute\` : فك ميوت صوتي عن عضو
 \`${prefix}vmute\` : اسكات عضو من الفويس
 \`${prefix}ban\` : حظر العضو
 \`${prefix}unban\` : الغاء الحظر من شخص
 \`${prefix}unbanal\` : الغاء المحظورين من السيرفر
 \`${prefix}allbans\` : قائمة المحظورين
 \`${prefix}kick\` : طرد عضو من السيرفر
 \`${prefix}setnick\` : تغيير اسم عضو داخل السيرفر
 \`${prefix}clear\` : مسح رسائل الشات
 \`${prefix}move\` : سحب عضو الى روم اخر
 \`${prefix}moveme\` : توديك لعضو بروم اخر
 \`${prefix}warn\` : اعطاء تحذير لعضو
 \`${prefix}warnings\` : الحصول على قائمة التحذيرات لعضو
 \`${prefix}remove-warn\` :  إزاله تحذير اعضاء
 \`${prefix}timeout\` : اعطاء تايم اوت
 `)
        interaction.update({ embeds: [replyembed] });
      }  if (interaction.values == "help3") {
        let replyembed = new Discord.MessageEmbed()
      .setTitle('آوامر ألرولات')
      .setColor(`${Color || `#4e464f`}`)
      .setDescription(`
 \`${prefix}role\` : اضافة رتبة لعضو
 \`${prefix}myrole\` : تعديل رولك الخاص
 \`${prefix}dsrole\` : حذف رول خاص
 \`${prefix}srole\` : انشاء رول خاص
 \`${prefix}addrole\` : انشاء رول جديد
 \`${prefix}autorole\` : اضافة رتبة لكل عضو يدخل
 \`${prefix}daorole\` : حذف تحديد الرول التلقائي
 \`${prefix}allrole\` : اعطاء رول لجميع الاعضاء
 \`${prefix}removrole\` : ازاله رول من جميع الاعضاء
 \`${prefix}here\` : اضافة رول الهير للعضو
 \`${prefix}pic\` : اضافة رول الصور للعضو
 \`${prefix}live\` : اضافة رتبة تسمح بفتح كام وشير
 \`${prefix}nick\` : اضافة رتبه تغير الآسم
 \`${prefix}check\` : تشييك على الاعضاء في الرول
 \`${prefix}checkvc\` : تشييك علي الاعضاء في الرول المتصلين بالرومات الصوتية
`)

        interaction.update({ embeds: [replyembed] })
      }
      

      if (interaction.values == "help4") {
        let replyembed = new Discord.MessageEmbed()
      .setTitle('آوامر  الشاتات')
      .setColor(`${Color || `4e464f`}`)
      .setDescription(`
 \`${prefix}ochat\` : تحديد شات الاوامر
 \`${prefix}hide\` : إحفاء الشات عن الكل
 \`${prefix}show\` : إظهار الشات للكل
 \`${prefix}lock\` : قفل الروم
 \`${prefix}unlock\` : فتح الروم
 \`${prefix}slowmode\` : تفعيل الوضع البطيئ بالروم
 \`${prefix}autoreply\` : اضافة كلمة وردها
 \`${prefix}dreply\` : حذف كلة وردها
 \`${prefix}mhide\` : إخفاء الشات عن عضو
 \`${prefix}mshow\` : إظهار الشات لعضو
 \`${prefix}autoline\` : فاصل تلقائي بالشات
 \`${prefix}unline\` : تعطيل الفاصل التلقائي بالشات
 \`${prefix}setreact\` : رياكشن تلقائي بالشات
 \`${prefix}unreact\` : تعطيل الرياكشن التلقائي بالشات
 \`${prefix}applay\` : تفعيل المنشن والصور بالشات
 \`${prefix}disapplay\` : تعطيل المنشن والصور بالشات
 \`${prefix}setpic\` : شات الصور
 \`${prefix}unpic\` : تعطيل شات الصور
 \`${prefix}setrchat\` : تعيين شات التقييمات
 \`${prefix}dltrchat\` : حذف شات التقييمات
 \`${prefix}setrimage\` : تعيين صورة التقييمات
 \`${prefix}setrcolor\` : تعين لون صورة خط التقييمات

`)
      
        interaction.update({ embeds: [replyembed] })
      }

      if (interaction.values == "help5") {
        let replyembed = new Discord.MessageEmbed()
      .setTitle("💡 آوامر الحماية :")
      .setColor(`${Color || `#4e464f`}`)
      .setDescription(`
 \`${prefix}bots\` : اظهار البوتات الموجودة بالسيرفر
 \`${prefix}word\` : اضافة او ازالة كلمات يعاقب كاتبها
 \`${prefix}wordlist\` : عرض الكلامات التي يعاقب كاتبها
 \`${prefix}pslist\` : عرض قائمة الحماية المفعلة والمعطلة
 \`${prefix}restbackup\` : إسترجاع نسخة السيرفر المحفوظة 
 \`${prefix}restemoji\` : إسترجاع الاموجيات الخاصة بسيرفرك
 \`${prefix}block\` : منع عضو من دخول السيرفر
 \`${prefix}unblock\` : فك منع عضو من دخول السيرفر
 \`${prefix}setsecurity\` : إنشاء لوجات الحماية
 \`${prefix}wanti\` : إضافة أشخاص لتخطى الحماية
 \`${prefix}wantilist\` : عرض قائمة الاشخاص المسوح لهم 
 \`${prefix}setrjoin\` : تحديد الاجراء مع الحسابات الجديده
 \`${prefix}antijoin\` : تفعيل والغاء  تبنيد او سجن الحسابات الجديدة
 \`${prefix}antibots\` : تفعيل والغاء الحماية من البوتات
 \`${prefix}antilink\` : تفعيل والغاء الحماية من الروابط
 \`${prefix}antidelete\` : تفعيل والغاء حماية حذف الشاتات و الرولات
 \`${prefix}anticreate\` : تفعيل والغاء حناية من إنشاء الشاتات و الرولات
 \`${prefix}antispam\` : تفعيل والغاء الحماية من الاسبام

 `)
        interaction.update({ embeds: [replyembed] })
      
      }
      


      if (interaction.values == "help6") {
        let replyembed = new Discord.MessageEmbed()
      .setColor(`${Color || `4e464f`}`)
      .setTitle('آوامر  ألاعدادات')
      .setDescription(`
 \`${prefix}allow\` : السماح لعضو او رول لاستعمال امر
 \`${prefix}deny\` :  منع لعضو او رول لاستعمال امر
 \`${prefix}setlog\` : انشاء شاتات اللوق
 \`${prefix}detlog\` : حذف شاتات اللوق
 \`${prefix}imagechat\` : تحديد صوره لعلبة الالوان
 \`${prefix}ctcolors\` : انشاء رولات الوان 
 \`${prefix}setclear\` : إلغاء / تحديد شات المسج التلقائي
 \`${prefix}edit-wlc\` تعديل اعدادات الترحيب
 \`${prefix}edit-avt\` جميع اوامر تعديل سيرفرات الافتارت
 \`${prefix}locomnd\` : تفعيل او تعطيل امر
 \`${prefix}setvoice\` : تثبيت البوت بفويس 
 \`${prefix}progress\` : تفعيل إو ايقاف نظام النقاط
 \`${prefix}reset-all\` : تصفير جميع النقاط
 \`${prefix}reset\` : تصفير نقاط عضو
 \`${prefix}rlevel\` : قائمة جميع الفلات
`)
      
      




        interaction.update({ embeds: [replyembed] })
      }
      
      if (interaction.values == "help7") {
        let replyembed = new Discord.MessageEmbed()
      .setTitle('أوامر ألتذاكر')
      .setColor(`${Color || `#4e464f`}`)
      .setDescription(`
 \`${prefix}tipanel\` : جميع اوامر التحكم بالتذكرة
 \`${prefix}ticlog\` : تعين شات لوج التذكرة
 \`${prefix}tcsend\` : ارسال رسالة عند فتح التذكرة
 \`${prefix}tcopen\` : تعيين الكاتاقوري
 \`${prefix}setticket\` : عداد رسالة التذكرة
 \`${prefix}tcrole\` : اضافة رولات التذكرة
 \`${prefix}tcrestart\` : اعادة تعيين التذاكر
 \`${prefix}ticimage\` : تعيين صورة التذكرة
 \`${prefix}rename\` : تعين إسم جديد لتذكرة
 \`${prefix}close\` : إغلاق التذكرة المفتوحة
`)
        interaction.update({ embeds: [replyembed] })
      
      }
      
      if (interaction.values == "help9") {
        let replyembed = new Discord.MessageEmbed()
      .setColor(`${Color || `#4e464f`}`)
      .setTitle('💡 آوامر السيرفر :')
      .setDescription(`
  \`${prefix}guild [Server / id]\` : تغير سيرفر البوت
 \`${prefix}vip\` : أوامر ألاونر
 \`${prefix}dm\` : أرسال رساله لخاص العضو
 \`${prefix}say\` : أرسال رساله عن طريق البوت
 \`${prefix}setprefix\` : تغيير بادئه البوت
 \`${prefix}cmunprefix\` : أستعامل جميع الاوامر بدون برفيكس
 \`${prefix}owners\` : عرض قائمة الاونرات
 \`${prefix}setowner\` : إضافة اونر للبوت
 \`${prefix}removeowner\` : ازالة اونر من البوت
 \`${prefix}acomnd\` : أضافه اختصار للأوامر
 \`${prefix}listlcomnd\` : يظهر قائمة الاختصارات
 \`${prefix}removeShortcut\` : يحذف اختصار
`)
      
        interaction.update({ embeds: [replyembed] })
      }
      
      if (interaction.values == "help10") {
        if (interaction.user.id !== message.author.id) return; 
        interaction.message.delete()
          }
       
      });


    }
}
