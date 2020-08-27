function log(string) {
    const time = new Date();
    const logDiv = document.getElementById('logs');
    const li = document.createElement('li');
    li.innerHTML = time.toLocaleTimeString() + ": " + string;
    logDiv.appendChild(li);
}

function logQueueEmote() {

}

function unlogQueueEmote() {

}

export { log, logQueueEmote, unlogQueueEmote }