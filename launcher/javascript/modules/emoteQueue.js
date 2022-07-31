const net = require('net');
const path = require('path');
const remote = require('electron').remote;
import { log, unlogQueueEmote, logQueueEmote } from './logging.js';
import { formatAsString } from './pokemonCreation.js'
import { liveStatusRequestPipeName } from './constants.js';

async function isLuaScriptListening(saveFilePath) {
    return await new Promise((resolve, reject) => {
        let server;
        const timeout = setTimeout(() =>
        {
            if (server != null) {
                server.close();
            }
            resolve(false);
        }, 15000);
        server = net.createServer(c => {
            server.close();
            clearTimeout(timeout);
            resolve(true);
        });
        server.listen(
            path.join('\\\\.\\pipe\\' + liveStatusRequestPipeName)
        );
    });
}

function setupEmulatorPipe(saveFilePath, defaultPixels, defaultPalette) {
    const emoteQueue = [];

    setupQueuePipe(emoteQueue);
    /*setupConfigurationPipe(
        saveFilePath,
        defaultPixels.map(p => p.toString(16).padStart(2, '0')).join(''),
        defaultPalette.map(p => p.toString(16).padStart(2, '0')).join(''));*/

    return function(emote) {
        const emoteText = formatAsString(emote);
        emoteQueue.push(emoteText);
        logQueueEmote(emote);
    };
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
            emoteText = "0\r\n";
            log("writing blank text");
        }
        c.write(emoteText);
    });
    server.listen(
        path.join('\\\\.\\pipe\\doomred')
    );
}

function setupConfigurationPipe(saveFilePath, defaultPixels, defaultPalette) {
    const server = net.createServer(c => {
        log("writing lua configuration");
        c.write(saveFilePath + '\r\n' + defaultPixels + '\r\n' + defaultPalette + '\r\n');
    });
    server.listen(
        path.join('\\\\.\\pipe\\doomred-config')
    );
}

export { setupEmulatorPipe, isLuaScriptListening }