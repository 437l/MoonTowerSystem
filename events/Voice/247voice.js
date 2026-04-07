
let { joinVoiceChannel } = require("@discordjs/voice");
const db = require("pro.db");
const { Guild } = require(`${process.cwd()}/config`);

        client.on("ready", async () => {
            let Voice = await Data.get(`Voice_${client.user.id}`)
            const channel = client.channels.cache.get(Voice);
            if (!channel || channel.type !== "GUILD_VOICE") { return }
            const GUILD = channel.guild;
            const connection = joinVoiceChannel({
              channelId: Voice,
              guildId: GUILD.id,
              adapterCreator: GUILD.voiceAdapterCreator,
              selfDeaf: true
            });
            connection;
          })