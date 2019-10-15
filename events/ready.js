module.exports = (client) => {
    console.log(`${client.user.tag} est en ligne`);
    client.user.setPresence({
        clientStatus: "web",
        game: {
            name: 'Pour vous servir | ;Help',
            details: 'Faites ;Help pour accèder aux commandes !',
            type: 'STREAMING'
        }
    });
};