const png = require('pngjs');
const imageq = require('image-q');
const resizeImg = require('resize-img');

const emoteUrlTop = "https://static-cdn.jtvnw.net/emoticons/v1";
const emoteSize = "2.0";

async function downloadEmote(emoteId) {
    const fullEmoteUrl = emoteUrlTop + "/" + emoteId + "/" + emoteSize;
    const response = await fetch(fullEmoteUrl);
    if (response.ok) {
        return await response.arrayBuffer();
    }
    else {
        // TODO: Error handling
    }
}

async function formatEmote(rawImage) {
	const { pixels, palette } = await quantize(rawImage);
	const compressedPixels = compress(pixels);
	const compressedPalette = compress(palette);
	return formatAsString(compressedPixels, compressedPalette);
}

async function quantize(image) {
	const targetColors = 16;
	const resizedImage = await resizeImg(Buffer.from(image), {
		width: 32,
		height: 32
	});

	var { data, width, height } = png.PNG.sync.read(resizedImage);
	var pointContainer = imageq.utils.PointContainer.fromUint8Array(data, width, height);
	var distanceCalculator = new imageq.distance.Euclidean();
	var paletteQuantizer = new imageq.palette.RGBQuant(distanceCalculator, targetColors);
	paletteQuantizer.sample(pointContainer);
	var palette = paletteQuantizer.quantizeSync();
	var imageQuantizer = new imageq.image.NearestColor(distanceCalculator);
	var resultPointContainer = imageQuantizer.quantizeSync(pointContainer, palette);

	return { pixels: resultPointContainer, palette: palette };
}

function formatAsString(pixels, palette) {

}

function testLszz() {
    const palette = [0x00, 0x1f, 0x00, 0x1f, 0x00, 0x1f, 0x00, 0x1f, 0x00, 0x1f, 0x00, 0x1f, 0x00, 0x1f, 0x00, 0x1f, 0x00, 0x1f, 0x00, 0x1f, 0x00, 0x1f, 0x00, 0x1f, 0x00, 0x1f, 0x00, 0x1f, 0x00, 0x1f, 0x00, 0x1f];
    const compressedPalette = compress(palette);
    console.log(output.map(o => o.toString(16).padStart(2, '0')).join(' '));
}