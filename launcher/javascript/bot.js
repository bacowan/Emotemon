var tmi = require('tmi.js');

function runBotSubmit() {
    runBot();
    return false;
}

async function runBot() {
    const emoteJson = fs.readFile(emoteCacheFileName, (err, data) => {
        if (err != null) {
            // TODO: Error handling
        }
        else {
            runBotWithEmotes(JSON.parse(data));
        }
    });
}

function runBotWithEmotes(emotes) {
    console.log('connecting');
    const emulatorPipe = setupEmulatorPipe();

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
            if (commandName === '!pokemon' && context["display-name"] === "DoomInAJar") {
                handlePokemonCommand(commandValues);
            }
        }
    }

    async function handlePokemonCommand(commandValues) {
        if (commandValues.length > 1) {
            var emoteParam = commandValues[1];
            var emoteId = emotes[emoteParam]
            if (emoteParam == null) {
                // TODO: Error handling
                console.log("could not find emote: " + emoteParam);
            }
            else {
                console.log("got emote: " + emoteParam);
                const newPokemon = await createPokemon(emoteId, emoteParam)
                emulatorPipe.queueEmote(newPokemon);
            }
        }
    }

    function onConnected (addr, port) {
        console.log('connected');
    }
}