function log(string, level = "info") {
    const time = new Date();
    const logDiv = document.getElementById('logs');
    const li = document.createElement('li');
    li.innerHTML = time.toLocaleTimeString() + ": " + string;
    if (level == "message") {
        li.setAttribute("style", "color:green");
    }
    else if (level == "warning") {
        li.setAttribute("style", "color:yellow");
    }
    else if (level == "error") {
        li.setAttribute("style", "color:red; font-weight:bold");
    }
    else {
        li.setAttribute("style", "color:gray");
    }
    logDiv.appendChild(li);
}

function logQueueEmote(pokemon) {
    const buffer = new Uint8Array(pokemon.emoteImage);
    const blob = new Blob([buffer], {type: "img/png"});
    const urlCreator = window.URL || window.webkitURL;
    const imageUrl = urlCreator.createObjectURL(blob);

    const img = document.createElement('img');
    img.src = imageUrl;
    img.width = "50";
    img.height = "50";

    const text = document.createElement('p');
    text.innerHTML = pokemon.name;

    const row = document.createElement('div');
    row.appendChild(img);
    row.appendChild(text);

    const li = document.createElement('li');
    li.appendChild(row);

    const emotesDiv = document.getElementById('emote-queue');
    emotesDiv.prepend(li);
}

function unlogQueueEmote() {
    const emotesDiv = document.getElementById('emote-queue');
    emotesDiv.removeChild(emotesDiv.lastElementChild);
}

export { log, logQueueEmote, unlogQueueEmote }