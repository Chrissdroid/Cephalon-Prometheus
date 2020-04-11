const Discord = require('discord.js');
const optxp = new Set();

getRandomInteger = (min = 0, max = 20) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
};

module.exports = async (client, message) => {
    if (!message.guild || message.author.bot) return;

    defaultSettings = {
        xpEnabled: true,
        logsEnabled: false,
        logChannel: "mod-log",
        modRole: "Moderator",
        adminRole: "Administrator"
    };

    message.guild.conf = client.settings.ensure(message.guild.id, defaultSettings);

    if (message.guild.conf.xpEnabled) {
        const key = message.author.id;
        client.profile(key);

        if (!optxp.has(key)) {
            optxp.add(key);
            client.profiles.math(key, "+", getRandomInteger(5, 15), "points");
            setTimeout(() => {
                optxp.delete(key);
            }, 60000);
        }
        const curLevel = Math.floor(0.1 * Math.sqrt(client.profiles.get(key, "points")));
        let OneUP = false, lvlups = client.profiles.get(key, "rank");
        while (lvlups < curLevel) {
            lvlups++;
            OneUP = true;
        }
        if (OneUP) {
            client.profiles.set(key, curLevel, "rank");
            paliemoji = client.emojis.cache.find(emoji => emoji.name === "Tenno");
            if (curLevel <= 30) {
                const lvlembed = new Discord.MessageEmbed()
                    .setTitle(`${message.author.username} - **${curLevel}**${paliemoji}`)
                    .setDescription(`Vous avez obtenu le rang de maîtrise **${client.config.rank[curLevel].name}**, bien joué !`)
                    .setAuthor(`Montée de maitrise`, message.author.displayAvatarURL({
                        format: 'png',
                        dynamic: true,
                        size: 128
                    }))
                    .setThumbnail(client.config.rank[curLevel].img)
                    .setColor(3514045);
                message.channel.send({ embed: lvlembed });
            }
        }
    }

    if (message.content.toLowerCase().indexOf(client.config.prefix) !== 0) return;
    const args = message.content.slice(client.config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    const cmd = client.commands.get(command);
    if (!cmd) return;

    client.awaitcmd.ensure(message.author.id, { LoT: 0 });
    switch (client.awaitcmd.get(message.author.id, "LoT")) {
        case 0:
            client.awaitcmd.inc(message.author.id, "LoT");
            break;

        case 1:
            client.awaitcmd.inc(message.author.id, "LoT");
            mwait = await message.channel.send({
                embed: {
                    title: 'Veuillez patienter...',
                    description: "- Commande en cooldown, merci d'éviter de spam."
                }
            });
            return;

        default:
            return;
    }
    setTimeout(() => {
        client.awaitcmd.delete(message.author.id);
        if (typeof mwait !== 'undefined') mwait.delete().catch(O_o => { });
    }, 5000);

    console.log(`- commande "${command}" effectuée par l'utilisateur ${message.author.tag}`);
    cmd.run(client, message, args);
};