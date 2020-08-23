const net = require('net');
const path = require('path');

function setupEmulatorPipe() {

    const server = net.createServer(c => {
        c.write("1020000030001ff0019001ff\r\n");
    });
    server.listen(
        path.join('\\\\.\\pipe\\doomred')
    );

    return {
        addEmoteToQueue() {

        }
    }
}