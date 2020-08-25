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

async function createPokemon(id, name) {
	const pokemonData = {};

	const emoteImage = await downloadEmote(id);
	const { pixels, palette } = await formatEmote(emoteImage);

	pokemonData.pixels = pixels;
	pokemonData.palette = palette;

	pokemonData.attack1 = randBetween(1, attackCount);
	pokemonData.attack2 = randBetween(1, attackCount);
	pokemonData.attack3 = randBetween(1, attackCount);
	pokemonData.attack4 = randBetween(1, attackCount);
	pokemonData.pp1 = movePPs[pokemonData.attack1];
	pokemonData.pp2 = movePPs[pokemonData.attack2];
	pokemonData.pp3 = movePPs[pokemonData.attack3];
	pokemonData.pp4 = movePPs[pokemonData.attack4];
	pokemonData.ability = randBetween(1, abilityCount);
	pokemonData.gender = randBetween(0, 2);
	pokemonData.type1 = randBetween(0, Object.keys(types).length);
	pokemonData.type2 = randBetween(0, Object.keys(types).length);
	pokemonData.name = name

	const movesLearnableCount = randBetween(10, 20);
	pokemonData.movesLearnable = []
	for (let i = 0; i < movesLearnableCount; i++) {
		pokemonData.movesLearnable.push({
			level: randBetween(1, 60),
			move: randBetween(1, attackCount)
		});
	}

	return formatAsString(pokemonData);
}

function randBetween(min, max) {
	return Math.floor(Math.random() * max) + min;
}

function formatAsString(data) {
	return data.name + "\r\n" +
		+ data.attack1 + "\r\n" +
		+ data.attack2 + "\r\n" +
		+ data.attack3 + "\r\n" +
		+ data.attack4 + "\r\n" +
		+ data.pp1 + "\r\n" +
		+ data.pp2 + "\r\n" +
		+ data.pp3 + "\r\n" +
		+ data.pp4 + "\r\n" +
		+ data.ability + "\r\n" +
		+ data.gender + "\r\n" +
		+ data.type1 + "\r\n" +
		+ data.type2 + "\r\n" +
		+ data.movesLearnable.map(m => "L" + m.level + "M" + m.move + "E") + "\r\n" +
		data.pixels.map(p => p.toString(16).padStart(2, '0')).join('') + "\r\n" +
		data.palette.map(p => p.toString(16).padStart(2, '0')).join('') + "\r\n";
}

async function formatEmote(rawImage) {
	const { pixels, palette } = await quantize(rawImage);
	const compressedPixels = compress(pixels);
	const compressedPalette = compress(palette);
	return { pixels: compressedPixels, palette: compressedPalette }
}

async function quantize(image) {
	const targetColors = 16;
	const resizedImage = await resizeImg(Buffer.from(image), {
		width: 64,
		height: 64
	});

	var { data, width, height } = png.PNG.sync.read(resizedImage);
	var pointContainer = imageq.utils.PointContainer.fromUint8Array(data, width, height);
	var distanceCalculator = new imageq.distance.Euclidean();
	var paletteQuantizer = new imageq.palette.RGBQuant(distanceCalculator, targetColors);
	paletteQuantizer.sample(pointContainer);
	var palette = paletteQuantizer.quantizeSync();
	var imageQuantizer = new imageq.image.NearestColor(distanceCalculator);
	var resultPointContainer = imageQuantizer.quantizeSync(pointContainer, palette);

	const sortedPalette = palette._pointArray.sort((a,b) => a.a - b.a); // Sort by the alpha value so that full alpha ends up in position 0
	
	const paletteIndexes = Object.fromEntries(
		sortedPalette.map((point, index) => [point.uint32, index])
	);
	
	const formattedPalette = sortedPalette.map(i => {
		const val = (i.r >> 3) +
			((i.g >> 3) << 5) +
			((i.b >> 3) << 10);
		return [
			val % 0x100,
			val >> 8
		]
	}).flat();

	const palettedPixels = resultPointContainer._pointArray.map(p => {
		if (p.a === 0) {
			return 0;
		}
		else {
			return paletteIndexes[p.uint32];
		}
	});

	// tile
	const tiled = [];
	const tileSize = 8;
	const horizontalTileCount = width / 8;
	const verticalTileCount = height / 8;
	for (let i = 0; i < horizontalTileCount; i++) {
		for (let j = 0; j < verticalTileCount; j++) {
			for (let k = 0; k < tileSize * tileSize; k++) {
				tiled.push(palettedPixels[Math.floor(
					i * width * tileSize // for each vertical tile
					+ j * tileSize // for each horizontal tile
					+ k % tileSize // for each horizontal pixel in each tile
					+ Math.floor(k/tileSize) * height // for each vertical pixel in each tile
				)]);
			}
		}
	}

	const tiledAsBytes = [];
	for (let i = 0; i < tiled.length; i += 2) {
		tiledAsBytes.push(tiled[i] + (tiled[i + 1] << 4));
	}

	return { pixels: tiledAsBytes, palette: formattedPalette };
}

function testLszz() {
    const palette = [0x1f, 0x00, 0x1f, 0x00, 0x1f, 0x00, 0x1f, 0x00, 0x1f, 0x00, 0x1f, 0x00, 0x1f, 0x00, 0x1f, 0x00, 0x1f, 0x00, 0x1f, 0x00, 0x1f, 0x00, 0x1f, 0x00, 0x1f, 0x00, 0x1f, 0x00, 0x1f, 0x00, 0x1f, 0x00];
    const compressedPalette = compress(palette);
    console.log(output.map(o => o.toString(16).padStart(2, '0')).join(' '));
}