const net = require('net');
const path = require('path');
import { log, unlogQueueEmote, logQueueEmote } from './logging.js';
import { formatAsString } from './pokemonCreation.js'

function setupEmulatorPipe(defaultPixels, defaultPalette) {
    const emoteQueue = [];

    setupQueuePipe(emoteQueue);
    setupDefaultEmotePipe(defaultPixels.map(p => p.toString(16).padStart(2, '0')).join(''), defaultPalette.map(p => p.toString(16).padStart(2, '0')).join(''));

    return {
        queueEmote(emote) {
            const emoteText = formatAsString(emote);
            emoteQueue.push(emoteText);
            logQueueEmote(emote);
        }
    }
}

function setupQueuePipe(emoteQueue) {
    const server = net.createServer(c => {
        let emoteText;
        if (emoteQueue.length > 0) {
            emoteText = emoteQueue.shift();
            unlogQueueEmote();
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
}

function setupDefaultEmotePipe(defaultPixels, defaultPalette) {
    const server = net.createServer(c => {
        log("writing default emote");
        c.write(defaultPixels + '\r\n' + defaultPalette + '\r\n');
    });
    server.listen(
        path.join('\\\\.\\pipe\\doomred-default')
    );
}

export { setupEmulatorPipe }