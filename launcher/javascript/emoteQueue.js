const net = require('net');
const path = require('path');
import { log, unlogQueueEmote, logQueueEmote } from './logging.js';

function setupEmulatorPipe() {
    const emoteQueue = [];

    const server = net.createServer(c => {
        let emoteText;
        if (emoteQueue.length > 0) {
            emote = emoteQueue.shift();
            unlogQueueEmote(emote);
            const emoteText = formatAsString(emote);
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
        queueEmote(emoteText) {
            emoteQueue.push(emoteText);
            logQueueEmote(emote);
        }
    }
}

export { setupEmulatorPipe }