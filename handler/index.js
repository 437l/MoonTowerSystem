// index.js

const { glob } = require("glob");
const { promisify } = require("util");
const fs = require('fs');
const path = require('path');
const globPromise = promisify(glob);
const Data = require("pro.db");
const config = require(`${process.cwd()}/config`);

module.exports = async (client) => {

    // --- تحميل الأوامر (Commands) ---
    const commandFiles = await globPromise(`Commands/**/*.js`);
    
    commandFiles.forEach((value) => {
        const file = require(path.resolve(value));
        if (!file.name) return;

        const isEnabled = Data.get(`command_enabled_${file.name}`);
        if (isEnabled === false) return; 

        client.commands.set(file.name, file);

        if (file.aliases && Array.isArray(file.aliases)) {
            file.aliases.forEach(alias => {
                const aliasIsEnabled = Data.get(`command_enabled_${alias}`);
                if (aliasIsEnabled === false) return; 
                client.commands.set(alias, file);
            });
        }
    });

    
    // --- تحميل الإضافات (Extras) ---
    const extrasPath = path.join(process.cwd(), 'Extras', 'Guild');
    if (fs.existsSync(extrasPath)) {
        fs.readdirSync(extrasPath).filter(file => file.endsWith('.js')).forEach(file => {
            try {
                const extra = require(path.join(extrasPath, file));
                if (typeof extra === 'function') {
                    extra(client);
                }
            } catch (err) {
                console.error(`❌ خطأ في تحميل ملف الإضافة ${file}:`, err);
            }
        });
    }

    // --- تحميل الأحداث (Events) ---
    const eventFiles = await globPromise(`${process.cwd()}/events/**/*.js`);
    eventFiles.forEach((value) => {
        try {
            const event = require(path.resolve(value));
            if (typeof event === 'function') {
                const eventName = path.basename(value, '.js');
                client.on(eventName, event.bind(null, client));
            }
        } catch (err) {
            
        }
    });
};


