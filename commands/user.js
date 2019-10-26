const Discord = require('discord.js');

exports.run = (client, message, args) => {

    let permslvl = 1;

    const modRole = message.guild.roles.find(a => a.name === message.guild.conf.modRole);
    if (modRole && message.member.roles.has(modRole.id)) permslvl = 2;

    const adminRole = message.guild.roles.find(a => a.name === message.guild.conf.adminRole);
    if (adminRole && message.member.roles.has(adminRole.id) || message.guild.ownerID === message.author.id) permslvl = 3;

    if (message.author.id === client.config.ownerID) permslvl = 4;

    if (permslvl === 1) return message.channel.send("- Vous n'avez pas les permissions pour effectuer cela.");

    if (args.length < 2) return message.channel.send("- Vous devez pr�ciser l'utilisateur et l'action que vous voulez effectuer.", { code: 'md' });

    user = message.mentions.users.first() || client.users.get(args[1]);
    if (!user) return message.channel.send("- Vous devez pr�ciser l'utilisateur sur lequel vous voulez effectuer l'action.", { code: 'md' });

    let userinfo = client.profile(user.id);
    if (!userinfo) {
        return message.channel.send("D�sol� mais cette personne n'est pas dans mes bases de donn�es.");
    }

    let poll = client.polls.get(user.id);

    switch (args[0].toLowerCase()) {
        case 'info':
            let configProps = Object.keys(userinfo).map(prop => {
                return `\n${prop} :  ${message.guild.conf[prop]} ( ${typeof message.guild.conf[prop]} )`;
            });
            message.channel.send(`Voici les informations par rapport a cet utilisateur:\`\`\`json${configProps}\`\`\``);
            if (poll) {
                let pollProps = Object.keys(poll).map(prop => {
                    return `\n${prop} :  ${message.guild.conf[prop]} ( ${typeof message.guild.conf[prop]} )`;
                });
                message.channel.send(`Une poll est active sur cet utilisateur :\`\`\`json${pollProps}\`\`\``);
            }
            break;

        case 'delete':
            if (permslvl < 3) return message.channel.send("- Vous n'avez pas les permissions pour effectuer cela.");
            client.profiles.delete(user.id);
            if (poll) {
                client.polls.delete(user.id);
            }
            message.channel.send(`${user.username} �t� supprim� de la base de donn�es.`);
            break;

        case 'reset':
            message.channel.send(`${user.username} �t� remis a zero.`);
            break;

        case 'ban':
            break;

        case 'kick':
            break;

        case 'promote':
            break;

        case 'demote':
            break;
    }
};

exports.info = {
    name: "User Configuration",
    desc: "Configurez le profil d'un utilisateur",
    usage: ";User Info|Delete|Reset|Ban|Kick|Promote|Demote UserID|Mention",
    type: 2
};