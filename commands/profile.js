const Discord = require('discord.js');

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

	let profileEmbed = new Discord.MessageEmbed()
		.setColor(0x00AE86)
		.setAuthor(`Profil de ${user}`)
		.setDescription("```Voici le profil recherché !```")
		.setThumbnail(user.displayAvatarURL({
			format: 'png',
			dynamic: true,
			size: 128
		}))
		.setTimestamp(user.createdTimestamp)
		.addFields([
			{
				name: "__**Discord** :__",
				value: user.tag,
				inline: true
			}, {
				name: "__**Pseudo Warframe** :__",
				value: nick,
				inline: true
			}, {
				name: "__**Palier actuel** :__",
				value: `**${client.config.rank[userinfo.rank].name}** ( ${userinfo.rank}${paliemoji} - ${userinfo.points}points )`,
				inline: true
			}, {
				name: "__**As rejoins le Discord le** :__",
				value: `${timestamp.toLocaleString('fr-FR').slice(0, 20)}`,
				inline: true
			}
		])
		.setFooter(
			`Servis pour vous par Rafiki alias ${client.users.cache.get("207128825895714816").tag} | ${Math.pow((userinfo.rank + 1) / 0.1, 2) - userinfo.points} points avant le prochain palier !`,
			client.user.displayAvatarURL({
				format: 'png',
				dynamic: true,
				size: 128
			})
		);

	message.channel.send({
		embed: profileEmbed
	});
};

exports.info = {
	name: "Profile",
	desc: "Affiche votre profil ou celui de qui vous le souhaitez !",
	usage: ";Profile userID|Mention",
	type: 1
};