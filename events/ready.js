module.exports = (client) => {
    console.log(`${client.user.tag} est en ligne`);
    client.user.setPresence({
        status: "online",
        activity: {
            name: 'Rafiki on duty | ;Help',
            type: 'STREAMING'
        }
    });
};