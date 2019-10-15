exports.run = (client, message, args) => {
    if (message.author.id !== client.config.ownerID) return;

    if (!args || args.length < 1) return message.reply("Vous devez préciser le nom de la commande.");
    const commandName = args[0];

    if (!client.commands.has(commandName)) {
        return message.reply("Cette commande n'existe pas");
    }

    delete require.cache[require.resolve(`./${commandName}.js`)];

    client.commands.delete(commandName);
    const props = require(`./${commandName}.js`);
    client.commands.set(commandName, props);
    message.reply(`La commande ${commandName} a été rechargée !`);
};

exports.info = {
    name: "Reload",
    desc: "Recharge une commande !",
    usage: ";Reload commandName",
    type: 4
};