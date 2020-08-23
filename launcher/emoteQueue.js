function queueEmote(emote) {

}const net = require('net');
const path = require('path');

function setupEmulatorPipe() {

    const server = net.createServer(c => {
        c.write(Buffer.from([0x10, 0x20, 0x00, 0x00, 0x30, 0x00, 0x1f, 0xf0, 0x01, 0x90, 0x01, 0xff]));
    });
    server.listen(
        path.join('\\\\.\\pipe\\doomred')
    );

    return {
        addEmoteToQueue() {

        }
    }
}