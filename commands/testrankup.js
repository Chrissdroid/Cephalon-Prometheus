const Discord = require('discord.js');

exports.run = (client, message, [nbt, ...args]) => {
    paliemoji = client.emojis.find(emoji => emoji.name === "Tenno");
    const lvlembed = new Discord.RichEmbed()
        .setTitle(`${message.author.username} - **${nbt}**${paliemoji}`)
        .setDescription(`Vous avez obtenu le rang de maîtrise **${client.config.rank[nbt].name}**, bien joué !`)
        .setAuthor(`Montée de maitrise`, message.author.displayAvatarURL)
        .setThumbnail(client.config.rank[nbt].img)
        .setColor(3514045);
    message.channel.send({ embed: lvlembed });
};