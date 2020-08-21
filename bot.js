const tmi = require('tmi.js');

function runBotSubmit() {
    runBot();
    return false;
}

function runBot() {
    const options = {
        identity: {
            username: document.getElementById('botName').value,
            password: document.getElementById('oauth').value
        },
        channels: [
            document.getElementById('channel').value
        ]
    }

    const client = new tmi.client(options);
    client.on('message', onMessage);
    client.on('connected', onConnected);
    client.connect();

    function onMessage (target, context, msg, isSelf) {
        if (isSelf) { return; }
        
        const commandValues = msg.split(" ");
        if (commandValues.length > 0) {
            const commandName = commandValues[0];
            if (commandName === '!pokemon') {
                handlePokemonCommand(commandValues);
            }
        }
    }

    function handlePokemonCommand(commandValues) {
        if (commandValues.length > 1) {
            var emoteParam = commandValues[1];
        }
    }

    function onConnected (addr, port) {
        console.log('connected');
    }
}