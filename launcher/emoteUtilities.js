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

function formatEmote(rawImage) {
}

async function testFormatEmote() {
	//var img = document.createElement("img");
	//img.onload = () => {
		var targetColors = 16;
		const image = fs.readFileSync("imGlitch.png");
		const resizedImage = await resizeImg(image, {
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
		
	//}

	//imageq.utils.PointContainer.fromBuffer
	//img.src = "https://static-cdn.jtvnw.net/emoticons/v1/112290/1.0";
	//document.body.appendChild(img);




    /*const { data, width, height } = png.PNG.sync.read(fs.readFileSync("imGlitch.png"));
    const inPointContainer = imageq.utils.PointContainer.fromUint8Array(data, width, height);

    const palette = imageq.buildPaletteSync([inPointContainer]);
    const outPointContainer = imageq.applyPaletteSync(inPointContainer, palette);*/




    /*const img = await loadImage("https://static-cdn.jtvnw.net/emoticons/v1/112290/1.0");
    const can = createCanvas(img.width, img.height);
    const context = can.getContext('2d');
    context.drawImage(img, 0, 0, img.width, img.height);
    const q = new RgbQuant();
    q.sample(can);
    const pal = q.palette(true);
    const out = q.reduce(can);*/

	//const emote = await downloadEmote(112290);
    //await fs.promises.writeFile("imGlitch.png", Buffer.from(emote));
}

function testLszz() {
    const palette = [0x00, 0x1f, 0x00, 0x1f, 0x00, 0x1f, 0x00, 0x1f, 0x00, 0x1f, 0x00, 0x1f, 0x00, 0x1f, 0x00, 0x1f, 0x00, 0x1f, 0x00, 0x1f, 0x00, 0x1f, 0x00, 0x1f, 0x00, 0x1f, 0x00, 0x1f, 0x00, 0x1f, 0x00, 0x1f];
    const compressedPalette = compress(palette);
    console.log(output.map(o => o.toString(16).padStart(2, '0')).join(' '));
}