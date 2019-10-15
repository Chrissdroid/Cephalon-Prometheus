const Discord = require('discord.js');

exports.run = async (client, message, args) => {

	let permslvl = 1;

	const modRole = message.guild.roles.find( a => a.name === message.guild.conf.modRole );
	if (modRole && message.member.roles.has(modRole.id)) permslvl = 2;

	const adminRole = message.guild.roles.find( a => a.name === message.guild.conf.adminRole );
	if (adminRole && message.member.roles.has(adminRole.id) || message.guild.ownerID === message.author.id) permslvl = 3;

	if (message.author.id === client.config.ownerID) permslvl = 4;

	const helpEmbed = new Discord.RichEmbed()
        .setAuthor(`Servis pour vous par Rafiki alias ${client.users.get("207128825895714816").tag}`, client.user.avatarURL)
		.setDescription("*Voici la liste de mes commandes !*")
		.setTimestamp(new Date());

	let chan = message.author, i = 1, footer = 'NormalMode (Tier 1 accessible)', filter = client.commands.get("help");
	switch (permslvl) {
		case 4:
			if (typeof args !== 'undefined' && args[0] === '-dev') {
				chan = message.channel;
			}
			i++;
            if (i === 2) footer = 'GodMode actif (Tier 4 autorisé)';

		case 3:
			i++;
            if (i === 2) footer = 'AdminMode actif (Tier 3 autorisé)';

		case 2:
			i++;
            if (i === 2) footer = 'ModeratorMode actif (Tier 2 autorisé)';

		default:
            helpEmbed.setFooter(footer, message.author.avatarURL);
			filter = client.commands.filter( c => typeof c.info !== 'undefined' && c.info.type <= i ).array();
			break;
	}
	const keep20 = filter.splice(0, 20);
	for(const command of keep20) {
		helpEmbed.addField(`\`T${command.info.type}\` - ${command.info.name}`, `${command.info.desc} \`\`\`css\n${command.info.usage}\`\`\``);
	}
	chan.send({embed: helpEmbed}).then(() => message.react("✅"));
}