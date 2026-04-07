const db = require("pro.db");

module.exports = async (client) => {
    client.on('channelDelete', async (channel) => {
        if (channel.type === 'GUILD_TEXT' && db.has(`channel${channel.id}`)) {
            try {
                const memberId = db.get(`channel${channel.id}`);
                
                db.delete(`channel${channel.id}`);
                if (memberId) {
                    db.delete(`member${memberId}`);
                }
            } catch (error) {
                console.error("Error during channelDelete cleanup:", error);
            }
        }
    });
};