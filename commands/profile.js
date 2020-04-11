exports.run = (client, message, args) => {

	let user = (
		message.mentions.users.size ? message.mentions.users.first() : null
	) || client.users.cache.get(args[0]);
	if (!user) {
		user = message.author;
	}

	let userinfo = client.profile(user.id);
	if (!userinfo) {
		return message.channel.send("Désolé mais cette personne n'est pas dans mes bases de données.");
	}

	let paliemoji = client.emojis.cache.find(emoji => emoji.name === "Tenno"),
		timestamp, nick;
	if (message.guild.members.cache.get(user.id)) {
		timestamp = new Date(message.guild.members.cache.get(user.id).joinedAt);
		nick = message.guild.members.cache.get(user.id).nickname;
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
				url: user.displayAvatarURL({
					format: 'png',
					dynamic: true,
					size: 128
				})
			},
			fields: [{
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
					"value": `**${client.config.rank[userinfo.rank].name}** ( ${userinfo.rank}${paliemoji} - ${userinfo.points}points )`,
					"inline": true
				},
				{
					"name": "__**As rejoins le Discord le** :__",
					"value": `${timestamp.toLocaleString('fr-FR').slice(0, 20)}`,
					"inline": true
				}
			],
			timestamp: user.createdTimestamp,
			footer: {
				icon_url: client.user.displayAvatarURL({
					format: 'png',
					dynamic: true,
					size: 128
				}),
				text: `Servis pour vous par Rafiki alias ${client.users.cache.get("207128825895714816").tag} | ${Math.pow((userinfo.rank + 1) / 0.1, 2) - userinfo.points} points avant le prochain palier !`
			}
		}
	});
};

exports.info = {
	name: "Profile",
	desc: "Affiche votre profil ou celui de qui vous le souhaitez !",
	usage: ";Profile userID|Mention",
	type: 1
};