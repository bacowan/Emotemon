const remote = require('electron').remote;
const fs = require('fs');
const path = require('path');
import { emoteCacheFileName } from './constants.js';

const clientId = '48jcq0qugs9x7cscqj364iimlpw9gm';

const app = remote.app;
const appDataPath = app.getPath('userData');

async function updateEmoteCache() {
    // TODO: show user that load is happening/done.
    const response = await fetch("https://api.twitch.tv/kraken/chat/emoticon_images", {
        headers: {
            Accept: 'application/vnd.twitchtv.v5+json',
            'Client-ID': clientId
        }
    });

    if (response.ok) {
        const emotes = JSON.stringify(
            parseDownloadedEmotes(await response.json()));
        const fullEmoteCachePath = path.join(appDataPath, emoteCacheFileName);
        await fs.promises.writeFile(fullEmoteCachePath, emotes);
        updateCacheLastUpdatedText();
    }
    else {
        // TODO: Error handling
    }

    function parseDownloadedEmotes(emoteJson) {
        return emoteJson.emoticons.reduce((map, e) => {
            map[e.code] = e.id;
            return map;
        }, {});
    }
}

function updateCacheLastUpdatedText() {
    const fullEmoteCachePath = path.join(appDataPath, emoteCacheFileName);
    fs.stat(fullEmoteCachePath, (err, stats) => {
        const emoteCacheText = document.getElementById("emoteCacheLastUpdate");
        if (err != null) {
            emoteCacheText.innerHTML = "never";
        }
        else {
            emoteCacheText.innerHTML = stats.mtime;
        }
    });
}

export { updateEmoteCache, updateCacheLastUpdatedText }