const fs = require('fs');
const clientId = '48jcq0qugs9x7cscqj364iimlpw9gm';
const emoteCacheFileName = 'emoteCache.json';

function updateEmoteCache() {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState === 4) {
            const emotes = xmlHttp.responseText;
            fs.writeFile(emoteCacheFileName, emotes, err => {
                if (err == null) {
                    updateCacheLastUpdatedText();
                }
            });
            // TODO: show user that load is happening/done.
        }
    }
    xmlHttp.open("GET", "https://api.twitch.tv/kraken/chat/emoticon_images");
    xmlHttp.setRequestHeader('Accept', 'application/vnd.twitchtv.v5+json');
    xmlHttp.setRequestHeader('Client-ID', clientId);
    xmlHttp.send(null);
}

function onload() {
    updateCacheLastUpdatedText();
}

function updateCacheLastUpdatedText() {
    fs.stat(emoteCacheFileName, (err, stats) => {
        const emoteCacheText = document.getElementById("emoteCacheLastUpdate");
        if (err != null) {
            emoteCacheText.innerHTML = err;
        }
        else {
            emoteCacheText.innerHTML = stats.mtime;
        }
    });
}