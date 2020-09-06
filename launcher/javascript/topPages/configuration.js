const remote = require('electron').remote;
const fs = require('fs');
const path = require('path');
import { settingsFileName, defaultSaveFileName } from '../modules/constants.js';
import { updateEmoteCache as updateEmoteCacheDontWrite, getCacheLastUpdated } from '../modules/emoteCache.js';

const app = remote.app;
const appDataPath = app.getPath('userData');

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

function onAdvancedClicked() {
    const headerElement = document.getElementById('advancedHeader');
    const divElement = document.getElementById('advancedDiv');

    if (divElement.style.display == "none") {
        headerElement.innerHTML = "Advanced ▼"
        divElement.style.display = "block";
    }
    else {
        headerElement.innerHTML = "Advanced ▶"
        divElement.style.display = "none";
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

async function updateEmoteCache() {
    await updateEmoteCacheDontWrite();
    await updateEmoteCacheText();
}

async function updateEmoteCacheText() {
    const cacheLastUpdated = await getCacheLastUpdated();
    document.getElementById("emoteCacheLastUpdate").innerHTML = cacheLastUpdated.toLocaleString();
}

export { onConfigurationPageLoad, save, onAdvancedClicked, updateEmoteCache }