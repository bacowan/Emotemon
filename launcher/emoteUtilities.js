const emoteUrlTop = "https://static-cdn.jtvnw.net/emoticons/v1/1/1.0"
const emoteSize = "1.0";

async function downloadEmote(emoteId) {
    const fullEmoteUrl = emoteUrlTop + "/" + emoteId + "/" + emoteSize;
    const response = await fetch(fullEmoteUrl);
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
    const palette = [0x00, 0x1f, 0x00, 0x1f, 0x00, 0x1f, 0x00, 0x1f, 0x00, 0x1f, 0x00, 0x1f, 0x00, 0x1f, 0x00, 0x1f, 0x00, 0x1f, 0x00, 0x1f, 0x00, 0x1f, 0x00, 0x1f, 0x00, 0x1f, 0x00, 0x1f, 0x00, 0x1f, 0x00, 0x1f];
    const compressedPalette = compress(palette);
    console.log(output.map(o => o.toString(16).padStart(2, '0')).join(' '));
}