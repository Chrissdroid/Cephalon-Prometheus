const Discord = require('discord.js');

exports.run = (client, message, args) => {
	let paliemoji = client.emojis.cache.find(emoji => emoji.name === "Tenno");

	const sorted = client.profiles.array().sort((a, b) => b.points - a.points);
	const top10 = sorted.splice(0, 10);

	const embed = new Discord.MessageEmbed()
		.setTitle("Leaderboard")
		.setAuthor(client.user.username, client.user.displayAvatarURL({
			format: 'png',
			dynamic: true,
			size: 128
		}))
		.setDescription("Voici nos 10 meilleurs opérateurs !")
		.setColor(0x00AE86);

	let fieldtitle;
	var i = 1;
	for (const data of top10) {
		let user = client.users.cache.get(data.user);
		if (!user) continue;

		switch (i) {
			case 1:
				fieldtitle = `🥇 ${user.tag} - ${data.rank}${paliemoji}`;
				embed.setThumbnail(client.config.rank[data.rank].img);
				break;
			case 2:
				fieldtitle = `🥈 ${user.tag} - ${data.rank}${paliemoji}`;
				break;
			case 3:
				fieldtitle = `🥉 ${user.tag} - ${data.rank}${paliemoji}`;
				break;
			default:
				fieldtitle = user.tag;
				break;
		}
		embed.addField( fieldtitle, `**${client.config.rank[data.rank].name}** ( ${data.points}points )` );
		i++;
	}
	return message.channel.send({ embed });
};

exports.info = {
	name: "Leaderboard",
	desc: "L'élite du serveur !",
	usage: ";top",
	type: 1
};