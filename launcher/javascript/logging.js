function log(string) {
    const logDiv = document.getElementById('logs');
    const li = document.createElement('li');
    li.innerHTML = string;
    logDiv.appendChild(li);
}

function logQueueEmote() {

}

function unlogQueueEmote() {

}

export { log, logQueueEmote, unlogQueueEmote }