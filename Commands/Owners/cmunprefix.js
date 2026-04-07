const fs = require("fs");
const { owners } = require(`${process.cwd()}/config`);

module.exports = {
    name: 'cmunprefix',
    run: async (client, message, args) => {
        if (!owners.includes(message.author.id)) return message.react('❌');

        try {
            const data = fs.readFileSync("./config.json", "utf8");
            const config = JSON.parse(data);

            config.prefix = "";

            fs.writeFileSync("./config.json", JSON.stringify(config, null, 4));

            message.react('✅');
        } catch (err) {
            console.error(err);
            message.react('❌');
        }
    }
};
