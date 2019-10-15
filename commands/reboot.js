const config = require('../config.json');

exports.run = (client, message) => {
    if (message.author.id !== client.config.ownerID) return;

    message.channel.send('Redémarage...')
        .then(msg => client.destroy()
            .then(() => client.login(config.token)
                .then(() => msg.edit('Redémarage effectué !'))
            )
        );
};

exports.info = {
    name: "Reboot",
    desc: "Redémarage système !",
    usage: ";Reboot",
    type: 4
};