// adapted from https://github.com/magical/nlzss/blob/master/compress.py
// (see LICENSE file)

class DefaultDict {
    constructor() {
        this.dict = {};
    }

    add(key, value) {
        let list = this.dict[key];
        if (list == null) {
            list = [];
            this.dict[key] = list;
        }
        list.push(value);
    }

    get(key) {
        let ret = this.dict[key];
        if (ret == null) {
            ret = [];
            this.dict[key] = ret;
        }
        return ret;
    }
}

class SlidingWindow {
    constructor(buf) {
        // The size of the sliding window
        this.size = 4096;
        // The minimum displacement.
        this.disp_min = 2;
        // The hard minimum — a disp less than this can't be represented in the
        // compressed stream.
        this.disp_start = 1;
        // The minimum length for a successful match in the window
        this.match_min = 3;
        // The maximum length of a successful match, inclusive.
        this.match_max = 3 + 0xf;

        this.data = buf;
        this.hash = new DefaultDict();
        this.full = false;

        this.start = 0;
        this.stop = 0;
        this.index = 0;
    }

    next() {
        if (this.index < this.disp_start - 1) {
            this.index++;
            return;
        }

        if (this.full) {
            const oldItem = this.data[this.start];
            this.hash.get(oldItem).pop();
        }

        const item = this.data[this.stop];
        this.hash.get(item).push(this.stop);
        this.stop++;
        this.index++;

        if (this.full) {
            this.start++;
        }
        else if (this.size <= this.stop) {
            this.full = true;
        }
    }

    advance(n = 1) {
        // Advance the window by n bytes
        for (let i = 0; i < n; i++) {
            this.next();
        }
    }

    search() {
        const counts = [];
        const indices = this.hash.get(this.data[this.index]);
        for (const i of indices) {
            const matchlen = this.match(i, this.index);
            if (matchlen >= this.match_min) {
                const disp = this.index - i;
                if (this.disp_min <= disp) {
                    counts.push([matchlen, -disp]);
                    if (matchlen >= this.match_max) {
                        return counts[counts.length - 1];
                    }
                }
            }
        }

        if (counts.length > 0) {
            return counts.reduce((next, current) => {
                if (next[0] > current[0]) {
                    return next;
                }
                else {
                    return current;
                }
            }, counts[0]);
        }
        else {
            return null;
        }
    }

    match(start, bufstart) {
        const size = this.index - start;

        if (size === 0) {
            return 0;
        }

        let matchlen = 0;

        for (var i = 0; i < Math.min(this.data.length - bufstart, this.match_max); i++) {
            if (this.data[start + (i % size)] == this.data[bufstart + i]) {
                matchlen += 1;
            }
            else {
                break;
            }
        }
        return matchlen;
    }
}

function* _compress(input) {
    // Generates a stream of tokens. Either a byte (int) or a tuple of (count,
    // displacement).
    slidingWindow = new SlidingWindow(input);

    let i = 0;
    while (true) {
        if (input.length <= i) {
            break;
        }
        const match = slidingWindow.search();
        if (match != null) {
            yield match;
            slidingWindow.advance(match[0]);
            i += match[0];
        }
        else {
            yield input[i]
            slidingWindow.next();
            i++;
        }
    }
}

function* chunkit(it, n) {
    let buf = [];
    for (const i of it) {
        buf.push(i);
        if (n <= buf.length) {
            yield buf;
            buf = [];
        }
    }
    if (buf.length > 0) {
        yield buf;
    }
}

function packflags(flags) {
    let n = 0;
    for (let i = 0; i < 8; i++) {
        n = n << 1;
        try {
            if (flags[i]) {
                n = n | 1;
            }
        }
        catch(err) {
            continue;
        }
    }
    return n;
}

function pack(value, size, littleEndian=false) {
    let output = [];
    while (value > 0) {
        const byte = value % 0x100;
        output.push(byte);
        value = value >> 8;
    }

    while (output.length < size) {
        output.push(0);
    }

    if (!littleEndian) {
        output = output.reverse();
    }
    return output;
}

function compress(input) {
    output = []

    // Header
    // (contains the size of the decompressed data. 4 bytes long, little endian)
    // Note: I'm not sure what the purpose of the 0x10 is (the GBA expects it though)
    const sizeAsHex = pack((input.length << 8) + 0x10, size=4, littleEndian=true);
    Array.prototype.push.apply(
        output,
        sizeAsHex);

    // Body
    let length = 0;
    for (const tokens of chunkit(_compress(input), 8)) {
        const flags = tokens.map(t => Array.isArray(t));
        Array.prototype.push.apply(
            output,
            pack(packflags(flags), size=1));

        for (const t of tokens) {
            if (Array.isArray(t)) {
                var [count, disp] = t;
                count -= 3;
                disp = (-disp) - 1;
                const sh = (count << 12) | disp;
                Array.prototype.push.apply(
                    output,
                    pack(sh, size=2));
            }
            else {
                Array.prototype.push.apply(
                    output,
                    pack(t, size=1));
            }
        }

        length++;
        length += flags.reduce((a, b) => {
            return a + (b ? 2 : 1);
        }, 0);
    }

    // padding
    const padding = 4 - ((length % 4) || 4);
    for (let i = 0; i < padding; i++) {
        output.push(0xFF);
    }

    return output;
}