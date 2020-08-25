const net = require('net');
const path = require('path');

function setupEmulatorPipe() {
    const emoteQueue = [];

    const server = net.createServer(c => {
        let emoteText;
        if (emoteQueue.length > 0) {
            emoteText = emoteQueue.shift();
            console.log("writing emote");
        }
        else {
            emoteText = "\r\n";
            console.log("writing blank text");
        }
        c.write(emoteText);
    });
    server.listen(
        path.join('\\\\.\\pipe\\doomred')
    );

    return {
        queueEmote(emoteText) {
            emoteQueue.push(emoteText);
        }
    }
}