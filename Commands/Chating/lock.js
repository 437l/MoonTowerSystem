const { owners, prefix } = require(`${process.cwd()}/config`);
const Pro = require(`pro.db`)

module.exports = {
    name: 'lock', // هنا اسم الامر
  aliases: ["قفل",],
    run : (client, message, args) => {


      const isEnabled = Pro.get(`command_enabled_${module.exports.name}`);
      if (isEnabled === false) {
          return; 
      }

     const db = Pro.get(`Allow - Command lock = [ ${message.guild.id} ]`)
const allowedRole = message.guild.roles.cache.get(db);
const isAuthorAllowed = message.member.roles.cache.has(allowedRole?.id);

if (!isAuthorAllowed && message.author.id !== db  && !message.member.permissions.has('MANAGE_CHANNELS') && !owners.includes(message.author.id)) {
    // إجراءات للتصرف عندما لا يتحقق الشرط
    return;
}


      
   // const permission = message.member.permissions.has("MANAGE_CHANNELS");
    const guilds = message.guild.me.permissions.has("MANAGE_CHANNELS");
    const a8rgs = message.content.split(' ')
    const channel = message.mentions.channels.first() || client.channels.cache.get(a8rgs[1]) || message.channel;

    if (!guilds) return message.reply({ content: `:rolling_eyes: **I couldn't edit the channel permissions. Please check my permissions and role position.**`, ephemeral: true }).catch((err) => {
      console.log(`i couldn't reply to the message: ` + err.message)
    })
    let everyone = message.guild.roles.cache.find(hyper => hyper.name === '@everyone');
    channel.permissionOverwrites.edit(everyone, {
      SEND_MESSAGES: false,
      SEND_MESSAGES_IN_THREADS: false,
      CREATE_PUBLIC_THREADS: false,
      CREATE_PRIVATE_THREADS: false
    }).then(() => {
      message.react("✅").catch((err) => {
        console.log(`i couldn't reply to the message: ` + err.message)
      })
    })
 
 }   
}
