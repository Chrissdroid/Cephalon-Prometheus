exports.run = (client, message, [prop, ...value]) => {

    const adminRole = message.guild.roles.cache.find(role => role.name === message.guild.conf.adminRole);

    const set = value[0];
    const target = typeof prop !== 'undefined' ? prop.toLowerCase() : null;

    if (message.author.id === client.config.ownerID || adminRole && message.member.roles.cache.has(adminRole.id)) {
        switch (target) {
            case "adminrole":
                if (message.author.id !== client.config.ownerID) return message.reply("You're not the owner of this guild, sorry!");
                if (!set) return message.reply(`L'adminRole est actuellement configuré sur "${message.guild.conf.adminRole}" si vous voulez le changer, écrivez le nom du rôle à la suite de cette commande.`);
                client.settings.set(message.guild.id, value.join(" "), "adminRole");
                message.channel.send(`Configuration du serveur AdminRole a été changé en:\n\`${value.join(" ")}\``);
                break;

            case "modrole":
                if (!set) return message.reply(`L'modRole est actuellement configuré sur "${message.guild.conf.modRole}" si vous voulez le changer, écrivez le nom du rôle à la suite de cette commande.`);
                client.settings.set(message.guild.id, value.join(" "), "modRole");
                message.channel.send(`Configuration du serveur ModRole a été changé en:\n\`${value.join(" ")}\``);
                break;

            case "xp":
            case "xpenabled":
                if (!set) return message.reply(`Le système d'xp est actuellement sur "${message.guild.conf.xpEnabled}" si vous voulez le changer, écrivez "on" ou "off" à la suite de cette commande.`);
                switch (set) {
                    case "y":
                    case "ye":
                    case "on":
                    case "yes":
                    case "true":
                    case "enable":
                        client.settings.set(message.guild.id, true, "xpEnabled");
                        message.channel.send(`Configuration du serveur xpEnabled a été changé en:\n\`true\``);
                        break;

                    case "no":
                    case "off":
                    case "nope":
                    case "false":
                    case "disable":
                        client.settings.set(message.guild.id, false, "xpEnabled");
                        message.channel.send(`Configuration du serveur xpEnabled a été changé en:\n\`false\``);
                        break;
                }
                break;

            case "log":
            case "logenabled":
            case "logs":
            case "logsenabled":
                if (!set) return message.reply(`Le système de Logs est actuellement sur "${message.guild.conf.logsEnabled}" si vous voulez le changer, écrivez "on" ou "off" à la suite de cette commande.`);
                switch (set) {
                    case "y":
                    case "ye":
                    case "on":
                    case "yes":
                    case "true":
                    case "enable":
                        client.settings.set(message.guild.id, true, "logsEnabled");
                        message.channel.send(`Configuration du serveur logsEnabled a été changé en:\n\`true\``);
                        break;

                    case "no":
                    case "off":
                    case "nope":
                    case "false":
                    case "disable":
                        client.settings.set(message.guild.id, false, "logsEnabled");
                        message.channel.send(`Configuration du serveur logsEnabled a été changé en:\n\`false\``);
                        break;
                }
                break;

            case "logchannel":
            case "logschannel":
                if (!set) return message.reply(`Le channel utilisé pour les Logs est actuellement: "${message.guild.conf.logChannel}" si vous voulez le changer, écrivez le nom du channel approprié à la suite de cette commande.`);
                client.settings.set(message.guild.id, value.join(" "), "logChannel");
                message.channel.send(`Configuration du serveur logChannel a été changé en:\n\`${value.join(" ")}\``);
                break;

            default:
                let configProps = Object.keys(message.guild.conf).map(prop => {
                    return `\n${prop} :  ${message.guild.conf[prop]} ( ${typeof message.guild.conf[prop]} )`;
                });
                message.channel.send(`Voici la configuration actuelle du serveur:\`\`\`json${configProps}\`\`\``);
                break;
        }
    }
    else {
        return message.reply("Vous n'avez pas les permissions requises pour faire celà !");
    }
};

exports.info = {
    name: "Config",
    desc: "Permet l'édition de la configuration actuelle du serveur",
    usage: ";Config[ adminRole|modRole|logsChannel|xp|logs][ roleName|channelName|boolean]",
    type: 3
};