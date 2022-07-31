const remote = require('electron').remote;
const tmi = require('tmi.js');
const fs = require('fs');
const url = require('url');
const path = require('path');
const BrowserWindow = require('electron').remote.BrowserWindow;
import { log } from '../modules/logging.js';
import { setupEmulatorPipe } from '../modules/emoteQueue.js';
import { createPokemon, downloadEmote, formatEmote } from '../modules/pokemonCreation.js';
import { defaultEmoteName } from '../modules/constants.js';
import { isLuaScriptListening } from '../modules/emoteQueue.js';
import { settingsFileName, defaultEmoteId, chatCommand } from '../modules/constants.js';

const app = remote.app;
const appDataPath = app.getPath('userData');

async function loadConfiguration() {
    try {
        const configurationFilePath = path.join(appDataPath, settingsFileName);
        await fs.promises.access(configurationFilePath);
        const configurationText = await fs.promises.readFile(configurationFilePath);
        return JSON.parse(configurationText);
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
    const queueEmote = setupEmulatorPipe(configuration.saveFilePath, defaultPixels, defaultPalette);

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

                queueEmote(newPokemon);
            }
        }
    }c
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

async function setupChatBot(configuration, queueEmote) {
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

    async function handlePokemonCommand(commandValues, context) {
        if (commandValues.length > 1) {
            var emoteParam = commandValues[1];
            const emoteStartIndex = chatCommand.length + 1;
            const emoteEndIndex = emoteStartIndex + emoteParam.length - 1;
            const emoteTagText = emoteStartIndex + "-" + emoteEndIndex;
            var emoteId = Object.entries(context.emotes).find(e => e[1][0] === emoteTagText);
            if (emoteId == null || emoteId.length !== 2) {
                // TODO: Error handling
                log("could not find emote: " + emoteParam);
            }
            else {
                log("got emote: " + emoteParam);
                const newPokemon = await createPokemon(emoteId[0], emoteParam)

                queueEmote(newPokemon);
            }
        }
    }

    function onMessage (target, context, msg, isSelf) {
        if (isSelf) { return; }
        
        const commandValues = msg.split(" ");
        if (commandValues.length > 0) {
            const commandName = commandValues[0];
            if (commandName === '!pokemon' && context["display-name"] === "DoomInAJar") {
                handlePokemonCommand(commandValues, context);
            }
        }
    }

    function onConnected (addr, port) {
        log('connected');
    }
    
    client.on('message', onMessage);
    client.on('connected', onConnected);
    client.connect();
}

async function start() {
    const configuration = await loadConfiguration();
    const defaultEmote = await downloadEmote(defaultEmoteId);
	const { pixels: defaultPixels, palette: defaultPalette } = await formatEmote(defaultEmote);

    const queueEmote = setupEmulatorPipe(configuration.saveFilePath, defaultPixels, defaultPalette);
    setupChatBot(configuration, queueEmote);
}

function stop() {
    window.location.href = 'index.html';
}

function restart() {
    window.location.reload();
}

export { start, configure, stop, restart }