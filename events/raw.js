const events = {
    MESSAGE_REACTION_ADD: 'messageReactionAdd',
    MESSAGE_REACTION_REMOVE: 'messageReactionRemove'
};

module.exports = async (client, event) => {

    if (!events.hasOwnProperty(event.t)) return;

    const { d: data } = event;
    const user = client.users.get(data.user_id);
    const channel = client.channels.get(data.channel_id);

    const message = await channel.fetchMessage(data.message_id);
    const member = message.guild.members.get(user.id);

    const poll = client.polls.find(p => p.id === data.message_id);

    const emojiKey = data.emoji.id ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
    let reaction = message.reactions.get(emojiKey);

    if (!reaction) {
        const emoji = new Emoji(client.guilds.get(data.guild_id), data.emoji);
        reaction = new MessageReaction(message, emoji, 1, data.user_id === client.user.id);
    }

    if (message.author.id === client.users.get("179005213816913920").id && message.id === "601160502462251009" && data.emoji.name === "✅") {

        if (member.user.id !== client.user.id) {
            const roleObj = message.guild.roles.find(r => r.id === "332916063870255124");
            const roleObjDJ = message.guild.roles.find(r => r.id === "260191455568592896");

            if (event.t === "MESSAGE_REACTION_ADD") {
                member.addRole(roleObj.id);
                member.addRole(roleObjDJ.id);
            } else {
                member.removeRole(roleObj.id);
            }
        }
    }
    else if (typeof poll !== 'undefined' && poll.id === message.id && (data.emoji.name === "✅" || data.emoji.name === "⛔")) {

        if (data.emoji.name === "✅") {
            if (event.t === "MESSAGE_REACTION_ADD") {
                client.polls.inc(poll.author, 'plus');
            } else {
                if (poll.plus !== 0) {
                    if (poll.plus < 0) client.polls.set(poll.author, 'plus', 0);
                    else client.polls.dec(poll.author, 'plus');
                }
            }
        }
        else {
            if (event.t === "MESSAGE_REACTION_ADD") {
                client.polls.inc(poll.author, 'minus');
            } else {
                if (poll.minus !== 0) {
                    if (poll.minus < 0) client.polls.set(poll.author, 'minus', 0);
                    else client.polls.dec(poll.author, 'minus');
                }
            }
        }
    }
};