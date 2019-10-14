const Discord = require('discord.js');
const config = require("./config.json");
const client = new Discord.Client();
const SQLite = require("better-sqlite3");
const sql = new SQLite('./scores.sqlite');
function getRandomInteger(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

const talkedRecently = new Set();
const optxp = new Set();

client.on('ready', () => {
    client.user.setPresence({ status: 'online', game: { name: 'purger l\'hérésie (;help)' } });

	const table = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'scores';").get();
	if (!table['count(*)']) {
		// If the table isn't there, create it and setup the database correctly.
		sql.prepare("CREATE TABLE scores (id TEXT PRIMARY KEY, points INTEGER, level INTEGER);").run();
		// Ensure that the "id" row is always unique and indexed.
		sql.prepare("CREATE UNIQUE INDEX idx_scores_id ON scores (id);").run();
		sql.pragma("synchronous = 1");
		sql.pragma("journal_mode = wal");
	}

	const pollstable = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'polls';").get();
	if (!pollstable['count(*)']) {
		// If the table isn't there, create it and setup the database correctly.
		sql.prepare("CREATE TABLE polls (id TEXT PRIMARY KEY, author TEXT, question TEXT, plus INTEGER, minus INTEGER);").run();
		// Ensure that the "id" row is always unique and indexed.
		sql.prepare("CREATE UNIQUE INDEX idx_polls_id ON polls (id);").run();
		sql.pragma("synchronous = 1");
		sql.pragma("journal_mode = wal");
	}

	// And then we have two prepared statements to get and set the score data.
	client.getScore = sql.prepare("SELECT * FROM scores WHERE id = ?");
	client.unsetScore = sql.prepare("DELETE FROM scores WHERE id = ?");
	client.setScore = sql.prepare("INSERT OR REPLACE INTO scores (id, points, level) VALUES (@id, @points, @level);");
	client.getPollID = sql.prepare("SELECT * FROM polls WHERE id = ?");
	client.getPoll = sql.prepare("SELECT * FROM polls WHERE author = ?");
	client.unsetPoll = sql.prepare("DELETE FROM polls WHERE author = ?");
	client.setPoll = sql.prepare("INSERT OR REPLACE INTO polls (id, author, question, plus, minus) VALUES (@id, @author, @question, @plus, @minus);");

    console.log("Bot launched on " + client.user.username + " !");
});

client.on('guildMemberRemove', async member => {
	if (member.user.bot) return;
	client.unsetScore.run(member.id);
});

client.on("message", async message => {
    if (message.author.bot) return;
	let score, paliemoji;
	if (message.guild) {
		score = client.getScore.get(message.author.id);
		if (!score) {
			score = { id: message.author.id, points: 0, level: 1 }
		}
		paliemoji = client.emojis.find(emoji => emoji.name === "Tenno");
		if (!optxp.has(message.author.id)) {
			optxp.add(message.author.id);
			score.points += getRandomInteger(5, 15);
			setTimeout(() => {
				optxp.delete(message.author.id);
			}, 60000);
		}
		const curLevel = Math.floor(0.1 * Math.sqrt(score.points));
		let OneUP = false;
		while (score.level < curLevel) {
			score.level++;
			OneUP = true;
		}
		if (OneUP) {
			let lvlembed = new Discord.RichEmbed()
				.setTitle("Palier Supérieur !")
				.setDescription(`Vous êtes maintenant ${curLevel}${paliemoji}, gg !`)
				.setAuthor(message.author.username, message.author.displayAvatarURL)
				.setColor(3514045);
			message.channel.send({ embed: lvlembed });
		}
		client.setScore.run(score);
	}
	if (message.content.toLowerCase().indexOf(config.prefix) !== 0) return;
	const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
	const command = args.shift().toLowerCase();

	switch (command) {
		case "ping":
			m = await message.channel.send("Veuillez patienter...");
			m.edit(`Pong, j'ai ${m.createdTimestamp - message.createdTimestamp}ms de latence !`);
			break;

		case "emoji":
            message.channel.send(`${paliemoji}`);
			break;

		case "poll":
			if (!args.length) return message.channel.send("- Désolé mais vous devez précisez l'action que vous voulez faire.", {code : "md"});
			poll = client.getPoll.get(message.author.id);
			switch (args[0]) {
				case "create":
					if (!args[1]) return message.channel.send("- Désolé mais vous devez précisez ce que vous voulez mettre a voter.", {code : "md"});
					if (!poll) {
						args.shift();
			            message.channel.send({
			                embed: {
			                    color: 0x00AE86,
			                    author: {
			                        name: `Poll de ${message.author.username}`
			                    },
			                    description: "```"+args.join(" ")+"```",
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
							client.setPoll.run(poll);
							msg.react(`✅`).then(() => {
								msg.react(`⛔`);
							});
			            });
					}
					else {
						message.channel.send("- Vous avez déjà un poll en cours")
					}
					break;

				case "info":
				case "status":
					message.channel.send(`${poll.plus} sont pour, ${poll.minus} sont contre la proposition "${poll.question}"`)
					break;

				case "end":
				case "stop":
					poll = client.getPoll.get(message.author.id);
					if (!poll) return message.channel.send("- Vous n'avez pas de poll en cours", {code : "md"});
					message.channel.send(`Le Poll "${poll.question}" à été terminé avec succès, possédant ${poll.plus} votes pour et ${poll.minus} votes contre.`)
					client.unsetPoll.run(message.author.id);
					break;

				case "list":
					const polls = sql.prepare("SELECT * FROM polls LIMIT 20;").all();

					if (polls.length) {
						const embed = new Discord.RichEmbed()
							.setTitle("Polls en cours...")
							.setAuthor(client.user.username, client.user.avatarURL)
							.setColor(0x00AE86);

						for(const data of polls) {
							embed.addField(data.question, `	${data.plus} pour, ${data.minus} contre. Créé par ${client.users.get(data.author).tag}`);
						}

						return message.channel.send({embed});
					}
					else message.channel.send("- Aucune poll active pour le moment.", {code : "md"});

					break;

				case "dance":
					message.channel.send(`Du pûr génie. ~~tuez moi~~`);
			}
			break;

		case "xp":
			message.channel.send(`Vous êtes palier ${score.level} avec ${score.points} points a votre actif !`);
			break;

    	case "lb":
    	case "top":
    	case "leaderboard":
			const top10 = sql.prepare("SELECT * FROM scores ORDER BY points DESC LIMIT 10;").all();

			const embed = new Discord.RichEmbed()
				.setTitle("Leaderboard")
				.setAuthor(client.user.username, client.user.avatarURL)
				.setDescription("Voici nos 10 meilleurs opérateurs !")
				.setColor(0x00AE86);

			let fieldtitle;
			var i = 1;
			for(const data of top10) {
				switch(i) {
					case 1:
						fieldtitle = "🥇 " + client.users.get(data.id).tag;
						break;
					case 2:
						fieldtitle = "🥈 " + client.users.get(data.id).tag;
						break;
					case 3:
						fieldtitle = "🥉 " + client.users.get(data.id).tag;
						break;
					default:
						fieldtitle = client.users.get(data.id).tag;
						break;
				}
				embed.addField(fieldtitle, `${data.points} points (${data.level}${paliemoji})`);
				i++;
			}
			return message.channel.send({embed});
    		break;

        case "delete":
            if (!message.author.id === "207128825895714816") return;

            user = args[0];
            if (!user) return message.reply("You must mention someone or give their ID!");

            client.unsetScore.run(user)

            message.channel.send(`${user} été supprimé.`);
            break;

        case "give":
            if (!message.author.id === "207128825895714816") return;

            user = message.mentions.users.first() || client.users.get(args[0]);
            if (!user) return message.reply("You must mention someone or give their ID!");

            const pointsToAdd = parseInt(args[1], 10);
            if (!pointsToAdd) return message.reply("You didn't tell me how many points to give...");

            let userscore = client.getScore.get(user.id);
            if (!userscore) {
                userscore = { id: user.id, points: 0, level: 1 };
            }
            userscore.points += pointsToAdd;

            let userLevel = Math.floor(0.1 * Math.sqrt(score.points));
            if (userLevel < 1) { userLevel = 1; }
            userscore.level = userLevel;

            client.setScore.run(userscore);

            message.channel.send(`${user.tag} as reçus ${pointsToAdd} points d'xp et a maintenant ${userscore.points} points.`);
            break;

        case "p":
        case "profil":
        case "profile":
            user = message.mentions.users.first() || client.users.get(args[0]);
            if (!user) {
                user = message.author;
            }

            let userinfo = client.getScore.get(user.id);
            if (!userinfo) {
                return message.channel.send("Désolé mais cette personne n'est pas dans mes bases de données.");
            }

            let timestamp;
            let nick;
            if (message.guild.members.get(user.id)) {
                timestamp = message.guild.members.get(user.id).joinedAt;
                nick = message.guild.members.get(user.id).nickname;
            }
            if (!nick) {
                nick = user.username;
            }

            message.channel.send({
                embed: {
                    color: 0x00AE86,
                    author: {
                        name: `Profil de ${user.username}`
                    },
                    description: "```Voici le profil recherché !```",
                    thumbnail: {
                        url: user.avatarURL
                    },
                    fields: [
                        {
                            "name": "__**Discord** :__",
                            "value": user.tag,
                            "inline": true
                        },
                        {
                            "name": "__**Pseudo Warframe** :__",
                            "value": nick,
                            "inline": true
                        },
                        {
                            "name": "__**Palier actuel** :__",
                            "value": `${userinfo.level}${paliemoji} (${userinfo.points} points)`,
                            "inline": true
                        },
                        {
                            "name": "__**As rejoins le Discord le** :__",
                            "value": timestamp,
                            "inline": true
                        }
                    ],
                    timestamp: user.createdTimestamp,
                    footer: {
                        icon_url: client.user.avatarURL,
                        text: `Servis pour vous par ${client.users.get("207128825895714816").tag} | ${Math.pow((userinfo.level + 1) / 0.1, 2) - userinfo.points} points avant le prochain palier !`
                    }
                }
            });
            break;
    }
});

const events = {
	MESSAGE_REACTION_ADD: 'messageReactionAdd',
	MESSAGE_REACTION_REMOVE: 'messageReactionRemove',
};

client.on('raw', async event => {

    if (!events.hasOwnProperty(event.t)) return;

    const { d: data } = event;
    const user = client.users.get(data.user_id);
    const channel = client.channels.get(data.channel_id);

    const message = await channel.fetchMessage(data.message_id);
    const member = message.guild.members.get(user.id);

	const poll = client.getPollID.get(data.message_id);

    const emojiKey = (data.emoji.id) ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
    let reaction = message.reactions.get(emojiKey);

    if (!reaction) {
        // Create an object that can be passed through the event like normal
        const emoji = new Emoji(client.guilds.get(data.guild_id), data.emoji);
        reaction = new MessageReaction(message, emoji, 1, data.user_id === client.user.id);
    }

    if (message.author.id === client.users.get("179005213816913920").id && message.id === "601160502462251009" && data.emoji.name === "✅") {

       	if (member.user.id !== client.user.id) {
          	const roleObj = message.guild.roles.find(r => r.id === "332916063870255124");
          	const roleObjDJ = message.guild.roles.find(r => r.id === "260191455568592896");

         	if (event.t === "MESSAGE_REACTION_ADD") {
           		member.addRole(roleObj.id);
           		member.addRole(roleObjDJ.id);
          	} else {
            	member.removeRole(roleObj.id);
        	}
      	}
    }
    else if (poll && poll.id === message.id && (data.emoji.name === "✅" || data.emoji.name === "⛔")) {

        if (data.emoji.name === "✅") {
            if (event.t === "MESSAGE_REACTION_ADD") {
                poll.plus++;
            } else {
                poll.plus--;
            }
        }
        else {
            if (event.t === "MESSAGE_REACTION_ADD") {
                poll.minus++;
            } else {
                poll.minus--;
            }
        }
        client.setPoll.run(poll);
    }
});

client.login(config.token);