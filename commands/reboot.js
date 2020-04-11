const token = require('../token/access.json');

exports.run = async (client, message) => {
    if (message.author.id !== client.config.ownerID) return;

    msg = await message.channel.send('Redémarage...');
    client.destroy();
    await client.login(token.token);
    msg.edit('Redémarage effectué !');
};

exports.info = {
    name: "Reboot",
    desc: "Redémarage système !",
    usage: ";Reboot",
    type: 4
};