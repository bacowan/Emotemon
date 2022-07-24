const remote = require('electron').remote;
const fs = require('fs');
const path = require('path');
import { settingsFileName, defaultSaveFileName } from '../modules/constants.js';

const app = remote.app;
const appDataPath = app.getPath('userData');
const configData = require('../config.json');

async function onConfigurationPageLoad() {
    try {
        const configurationFilePath = path.join(appDataPath, settingsFileName);
        await fs.promises.access(configurationFilePath);
        const configurationText = await fs.promises.readFile(configurationFilePath);
        const configuration = JSON.parse(configurationText);
        document.getElementById('botName').value = configuration.botName;
        document.getElementById('oauth').value = configuration.oauth;
        document.getElementById('channel').value = configuration.channel;
        document.getElementById('saveFilePath').value = configuration.saveFilePath;
        await updateEmoteCacheText();
    }
    catch(err) {
        const defaultSaveFilePath = path.join(appDataPath, defaultSaveFileName);
        document.getElementById('saveFilePath').value = defaultSaveFilePath;
    }
}

async function onMgbaLoadClicked() {
    const result = await remote.dialog.showOpenDialog({properties: ['openFile']});
    if (!result.canceled && Array.isArray(result.filePaths) && result.filePaths.length === 1) {
        document.getElementById('mgba').value = result.filePaths[0];
    }
}

async function save() {
    const configurationFilePath = path.join(appDataPath, settingsFileName);
    const configuration = {
        botName: document.getElementById('botName').value,
        oauth: document.getElementById('oauth').value,
        channel: document.getElementById('channel').value,
        saveFilePath: document.getElementById('saveFilePath').value
    };
    await fs.promises.writeFile(configurationFilePath, JSON.stringify(configuration));
}

async function authenticate() {
    const clientId = configData.clientId;
    
    function uuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      }

    let popupWindow = new remote.BrowserWindow({
        webPreferences: {
            partition: uuid()
        }
    });
    popupWindow.webContents.on('did-finish-load', () => {
        const hash = new URL(popupWindow.getURL()).hash;
        if (hash) { // TODO: Error handling
            document.getElementById('oauth').value = hash.substring(hash.indexOf('=') + 1, hash.indexOf('&'));
            popupWindow.close();
        }
    });
    popupWindow.loadURL(
        "https://id.twitch.tv/oauth2/authorize"
            + "?response_type=token"
            + "&redirect_uri=" + "http://localhost:3000"
            + "&client_id=" + clientId
            //+ "&state=" //TODO
            + "&scope=chat%3Aread+chat%3Aedit");
}

export { onConfigurationPageLoad, save, onMgbaLoadClicked, authenticate }