const remote = require('electron').remote;
const exec = require("child_process").exec;
const spawn = require("child_process").spawn;
const tmi = require('tmi.js');
const fs = require('fs');
const url = require('url');
const path = require('path');
const BrowserWindow = require('electron').remote.BrowserWindow; 
import { settingsFileName } from '../modules/constants.js';
import { log } from '../modules/logging.js';
import { setupEmulatorPipe } from '../modules/emoteQueue.js';
import { createPokemon, downloadEmote, formatEmote } from '../modules/pokemonCreation.js';
import { defaultEmoteName } from '../modules/constants.js';

const app = remote.app;
const appDataPath = app.getPath('userData');

async function runEmulator() {
    //exec("\"" + process.env.ProgramFiles + "\\mGBA\\mGBA.exe\""); //TODO: make this the default, but overriable
}

async function runBot() {
    const config = loadConfiguration();
    if (!emulatorRunning(config)) {
        log("Lua script not running")
        return;
    }
    runBotWithConfiguration(config);

    // try {
    //     log("Loading configuration");
    //     const fullEmoteCachePath = path.join(appDataPath, emoteCacheFileName);
    //     const data = await fs.promises.readFile(fullEmoteCachePath);
    //     // TODO: Error handling
    //     const configuration = await loadConfiguration();
    
    //     runBotWithConfiguration(JSON.parse(data), configuration);
    // }
    // catch(err) {
    //     log("Failed to load emote cache. Please ensure that it is up to date.");
    // }
}

async function loadConfiguration() {
    try {
        const configurationFilePath = path.join(appDataPath, settingsFileName);
        await fs.promises.access(configurationFilePath);
        const configurationText = await fs.promises.readFile(configurationFilePath);
        const configuration = JSON.parse(configurationText);
        return {
            botName: configuration.botName,
            oauth: configuration.oauth,
            channel: configuration.channel,
            saveFilePath: configuration.saveFilePath
        }
    }
    catch(err) {
        // TODO: Error handling
    }
}

async function runBotWithConfiguration(emotes, configuration) {
    const defaultEmoteId = emotes[defaultEmoteName];
    const defaultEmote = await downloadEmote(defaultEmoteId);
	const { pixels: defaultPixels, palette: defaultPalette } = await formatEmote(defaultEmote);

    log('connecting');
    const emulatorPipe = setupEmulatorPipe(configuration.saveFilePath, defaultPixels, defaultPalette);

    const options = {
        identity: {
            username: configuration.botName,
            password: configuration.oauth
        },
        channels: [
            configuration.channel
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
                log("could not find emote: " + emoteParam);
            }
            else {
                log("got emote: " + emoteParam);
                const newPokemon = await createPokemon(emoteId, emoteParam)

                emulatorPipe.queueEmote(newPokemon);
            }
        }
    }

    function onConnected (addr, port) {
        log('connected');
    }
}

function configure() {
    const win = new BrowserWindow({
        width: 350,
        height: 675,
        webPreferences: {
           nodeIntegration: true
        }
     });
     //win.setMenu(null);
     win.loadURL(url.format ({ 
        pathname: path.join(__dirname, 'configuration.html'), 
        protocol: 'file:', 
        slashes: true 
     }));
}

function start() {

}

function stop() {
    window.location.href = 'index.html';
}

function restart() {
    window.location.reload();
}

export { start, configure, stop, restart }