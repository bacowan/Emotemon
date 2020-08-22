const lzjs = require('lzjs');

const emoteUrlTop = "https://static-cdn.jtvnw.net/emoticons/v1/1/1.0"
const emoteSize = "1.0";

function downloadEmote(emoteId) {
    const fullEmoteUrl = emoteUrlTop + "/" + emoteId + "/" + emoteSize;
    const response = fetch(fullEmoteUrl);
    if (response.ok) {
        return response.blob();
    }
    else {
        // TODO: Error handling
    }
}

function formatEmote(rawImage) {
}

function testLszz() {
    //const palette = '001F1F1F1F1F1F1F1F1F1F1F1F1F1F1F';
    //const paletteBuffer = buffer.from(palette, "hex")
    const palette = [0x00, 0x1F, 0x1F, 0x1F, 0x1F, 0x1F, 0x1F, 0x1F, 0x1F, 0x1F, 0x1F, 0x1F, 0x1F, 0x1F, 0x1F, 0x1F];
    const compressedPalette = compress(palette);
}