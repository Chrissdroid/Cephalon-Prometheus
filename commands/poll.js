const Discord = require('discord.js');

exports.run = (client, message, args) => {
    if (!args.length) return message.channel.send("- Désolé mais vous devez précisez l'action que vous voulez faire.", { code: "md" });
    poll = client.polls.get(message.author.id);
    switch (args[0].toLowerCase()) {
        case "create":
            if (!args[1]) return message.channel.send("- Désolé mais vous devez précisez ce que vous voulez mettre a voter.", { code: "md" });
            if (!poll) {
                args.shift();
                message.channel.send({
                    embed: {
                        color: 0x00AE86,
                        author: {
                            name: `Poll de ${message.author.username}`
                        },
                        description: "```" + args.join(" ") + "```",
                        thumbnail: {
                            url: message.author.avatarURL
                        },
                        fields: [
                            {
                                "name": "Êtes vous pour ?",
                                "value": "Réagissez ✅",
                                "inline": true
                            },
                            {
                                "name": "ou contre ?",
                                "value": "Réagissez ⛔",
                                "inline": true
                            }
                        ],
                        timestamp: message.createdTimestamp,
                        footer: {
                            icon_url: client.user.avatarURL,
                            text: client.user.tag
                        }
                    }
                }).then(msg => {
                    poll = { id: msg.id, author: message.author.id, question: args.join(" "), plus: 0, minus: 0 };
                    client.polls.ensure(message.author.id, poll);
                    msg.react(`✅`).then(() => {
                        msg.react(`⛔`);
                    });
                });
            }
            else {
                message.channel.send("- Vous n'avez pas de poll en cours", { code: "md" });
            }
            break;

        case "info":
        case "status":
            if (!poll) return message.channel.send("- Vous n'avez pas de poll en cours", { code: "md" });
            message.channel.send(`${poll.plus} sont pour, ${poll.minus} sont contre la proposition "${poll.question}"`);
            break;

        case "end":
        case "stop":
            if (!poll) return message.channel.send("- Vous n'avez pas de poll en cours", { code: "md" });
            message.channel.send(`Le Poll "${poll.question}" à été terminé avec succès, possédant ${poll.plus} votes pour et ${poll.minus} votes contre.`);
            client.polls.delete(message.author.id);
            break;

        case "list":
            const polls = client.polls.array().splice(0, 20);

            if (polls.length) {
                const embed = new Discord.MessageEmbed()
                    .setTitle("Polls en cours sur le serveur...")
                    .setAuthor(client.user.username, client.user.avatarURL)
                    .setColor(0x00AE86);

                for (const data of polls) {
                    embed.addField(data.question, `	${data.plus} pour, ${data.minus} contre. Créé par ${client.users.cache.get(data.author)}`);
                }

                return message.channel.send({ embed });
            }
            else message.channel.send("- Aucune poll active pour le moment.", { code: "md" });

            break;

        case "dance":
            message.channel.send(`Du pûr génie. ~~tuez moi~~`);
    }
};

exports.info = {
    name: "poll",
    desc: "Créez vos propres polls pour avoir l'avis de tout le monde !",
    usage: ";Poll Create|Info|End|List",
    type: 1
};