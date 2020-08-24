const net = require('net');
const path = require('path');

function setupEmulatorPipe() {
    const emoteQueue = [];

    const server = net.createServer(c => {
        let emoteText;
        if (emoteQueue.length > 0) {
            emoteText = emoteQueue.shift();
        }
        else {
            emoteText = "\r\n";
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