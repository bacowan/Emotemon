const fs = require('fs');
const clientId = '48jcq0qugs9x7cscqj364iimlpw9gm';
const emoteCacheFileName = 'emoteCache.json';

function updateEmoteCache() {
    // TODO: show user that load is happening/done.
    const response = fetch("https://api.twitch.tv/kraken/chat/emoticon_images", {
        headers: {
            Accept: 'application/vnd.twitchtv.v5+json',
            'Client-ID': clientId
        }
    });

    if (response.ok) {
        const emotes = JSON.stringify(
            parseDownloadedEmotes(response.json()));
        fs.writeFile(emoteCacheFileName, emotes, err => {
            if (err == null) {
                updateCacheLastUpdatedText();
            }
        });
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

function onload() {
    updateCacheLastUpdatedText();
}

function updateCacheLastUpdatedText() {
    fs.stat(emoteCacheFileName, (err, stats) => {
        const emoteCacheText = document.getElementById("emoteCacheLastUpdate");
        if (err != null) {
            emoteCacheText.innerHTML = "never";
        }
        else {
            emoteCacheText.innerHTML = stats.mtime;
        }
    });
}