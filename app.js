const Discord = require('discord.js');
const Enmap = require('enmap');
const fs = require('fs');

const client = new Discord.Client();
client.config = require('./config.json');

client.commands = new Enmap({ name: 'commands' });
client.profiles = new Enmap({ name: 'profiles' });
client.awaitcmd = new Enmap({
    name: 'awaitcmd',
    fetchAll: false,
    autoFetch: true,
    cloneLevel: 'deep'
});
client.awaitcmd.deleteAll();
client.settings = new Enmap({
    name: 'settings',
    fetchAll: false,
    autoFetch: true,
    cloneLevel: 'deep'
});

client.profile = (id) => {
    if (typeof id === 'undefined') return;
    const defaultProfile = {
        points: 0,
        rank: 0,
        coins: 150
    };

    const active = client.profiles.ensure(id, defaultProfile);

    return active;
};

fs.readdir("./events/", (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
        const event = require(`./events/${file}`);
        let eventName = file.split(".")[0];
        client.on(eventName, event.bind(null, client));
    });
});

fs.readdir("./commands/", (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
        if (!file.endsWith(".js")) return;
        let props = require(`./commands/${file}`);
        let commandName = file.split(".")[0];
        console.log(`Chargement de la commande '${commandName}'`);
        client.commands.set(commandName, props);
    });
});

client.login(client.config.token);