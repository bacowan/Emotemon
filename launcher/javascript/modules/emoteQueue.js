const net = require('net');
const path = require('path');
import { log, unlogQueueEmote, logQueueEmote } from './logging.js';
import { formatAsString } from './pokemonCreation.js'

function setupEmulatorPipe() {
    const emoteQueue = [];

    const server = net.createServer(c => {
        let emoteText;
        if (emoteQueue.length > 0) {
            emote = emoteQueue.shift();
            unlogQueueEmote(emote);
            log("writing emote");
        }
        else {
            emoteText = "\r\n";
            log("writing blank text");
        }
        c.write(emoteText);
    });
    server.listen(
        path.join('\\\\.\\pipe\\doomred')
    );

    return {
        queueEmote(emote) {
            const emoteText = formatAsString(emote);
            emoteQueue.push(emoteText);
            logQueueEmote(emote);
        }
    }
}

export { setupEmulatorPipe }