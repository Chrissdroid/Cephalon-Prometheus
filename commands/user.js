const Discord = require('discord.js');

exports.run = (client, message, args) => {

	let permslvl = 1;

	const modRole = message.guild.roles.cache.find(a => a.name === message.guild.conf.modRole);
	if (modRole && message.member.roles.cache.some(role => role.id === modRole.id)) permslvl = 2;

	const adminRole = message.guild.roles.cache.find(a => a.name === message.guild.conf.adminRole);
	if (adminRole && message.member.roles.cache.some(role => role.id === adminRole.id) || message.guild.ownerID === message.author.id) permslvl = 3;

	if (message.author.id === client.config.ownerID) permslvl = 4;

	if (permslvl === 1) return message.channel.send("- Vous n'avez pas les permissions pour effectuer cela.");

	if (args.length < 2) return message.channel.send("- Vous devez préciser l'utilisateur et l'action que vous voulez effectuer.", { code: 'md' });

	let user = (
		message.mentions.users.size ? message.mentions.users.first() : null
	) || client.users.cache.get(args[0]);
	if (!user) return message.channel.send("- Vous devez préciser l'utilisateur sur lequel vous voulez effectuer l'action.", { code: 'md' });

	let userinfo = client.profile(user.id);
	if (!userinfo) {
		return message.channel.send("Désolé mais cette personne n'est pas dans mes bases de données.");
	}

	let poll = client.polls.get(user.id);

	switch (args[0].toLowerCase()) {
		case 'info':
			let configProps = Object.keys(userinfo).map(prop => {
				return `\n${prop} :  ${userinfo[prop]} ( ${typeof userinfo[prop]} )`;
			});
			message.channel.send(`Voici les informations par rapport a cet utilisateur:\`\`\`json${configProps}\`\`\``);
			if (poll) {
				let pollProps = Object.keys(poll).map(prop => {
					return `\n${prop} :  ${poll[prop]} ( ${typeof poll[prop]} )`;
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
			message.channel.send(`${user} a été supprimé de la base de données.`);
			break;

		case 'reset':
			message.channel.send(`${user} a été remis a zero.`);
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