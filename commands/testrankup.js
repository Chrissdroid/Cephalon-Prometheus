const Discord = require('discord.js');

exports.run = (client, message, [nbt, ...args]) => {
    if (isNaN(nbt) || nbt > 30) return;
    let paliemoji = client.emojis.cache.find(emoji => emoji.name === "Tenno");
    const lvlembed = new Discord.MessageEmbed()
        .setTitle(`${message.author.username} - **${nbt}**${paliemoji}`)
        .setDescription(`Vous avez obtenu le rang de maîtrise **${client.config.rank[nbt].name}**, bien joué !`)
        .setAuthor(`Montée de maitrise`, message.author.displayAvatarURL({
            format: 'png',
            dynamic: true,
            size: 128
        }))
        .setThumbnail(client.config.rank[nbt].img)
        .setColor(3514045);
    message.channel.send({ embed: lvlembed });
};