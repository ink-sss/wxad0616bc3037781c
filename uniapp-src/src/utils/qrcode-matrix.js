const TOTAL_CODEWORDS = [
  26, 44, 70, 100, 134, 172, 196, 242, 292, 346,
  404, 466, 532, 581, 655, 733, 815, 901, 991, 1085,
  1156, 1258, 1364, 1474, 1588, 1706, 1828, 1921, 2051, 2185,
  2323, 2465, 2611, 2761, 2876, 3034, 3196, 3362, 3532, 3706,
];

const ECC_TOTAL_CODEWORDS_L = [
  7, 10, 15, 20, 26, 36, 40, 48, 60, 72,
  80, 96, 104, 120, 132, 144, 168, 180, 196, 224,
  224, 252, 270, 300, 312, 336, 360, 390, 420, 450,
  480, 510, 540, 570, 570, 600, 630, 660, 720, 750,
];

const ECC_BLOCKS_L = [
  1, 1, 1, 1, 1, 2, 2, 2, 2, 4,
  4, 4, 4, 4, 4, 4, 6, 6, 6, 7,
  8, 8, 9, 9, 10, 12, 12, 12, 13, 14,
  15, 16, 17, 18, 19, 19, 20, 21, 22, 24,
];

const FORMAT_ECC_L = 1;
const MASK_PATTERN = 0;

export function createQrMatrix(text) {
  const bytes = encodeUtf8(String(text || ""));
  if (!bytes.length) throw new Error("二维码内容为空");
  const version = chooseVersion(bytes.length);
  const size = version * 4 + 17;
  const modules = makeMatrix(size, false);
  const functions = makeMatrix(size, false);

  const setFunctionModule = (x, y, dark) => {
    modules[y][x] = !!dark;
    functions[y][x] = true;
  };

  drawFunctionPatterns(version, modules, functions, setFunctionModule);
  const dataCodewords = buildDataCodewords(bytes, version);
  const codewords = addErrorCorrection(dataCodewords, version);
  drawCodewords(modules, functions, codewords);
  drawFormatBits(size, setFunctionModule);
  if (version >= 7) drawVersionBits(version, size, setFunctionModule);
  return modules;
}

function chooseVersion(byteLength) {
  for (let version = 1; version <= 40; version += 1) {
    const dataCodewords = getDataCodewords(version);
    const countBits = version < 10 ? 8 : 16;
    const neededBits = 4 + countBits + byteLength * 8;
    if (neededBits <= dataCodewords * 8) return version;
  }
  throw new Error("二维码内容过长");
}

function getDataCodewords(version) {
  return TOTAL_CODEWORDS[version - 1] - ECC_TOTAL_CODEWORDS_L[version - 1];
}

function buildDataCodewords(bytes, version) {
  const dataCodewords = getDataCodewords(version);
  const bits = [];
  appendBits(bits, 0x4, 4);
  appendBits(bits, bytes.length, version < 10 ? 8 : 16);
  bytes.forEach((byte) => appendBits(bits, byte, 8));

  const capacity = dataCodewords * 8;
  appendBits(bits, 0, Math.min(4, capacity - bits.length));
  while (bits.length % 8) bits.push(0);

  const result = [];
  for (let i = 0; i < bits.length; i += 8) {
    let value = 0;
    for (let j = 0; j < 8; j += 1) value = (value << 1) | bits[i + j];
    result.push(value);
  }
  for (let pad = 0; result.length < dataCodewords; pad += 1) {
    result.push(pad % 2 === 0 ? 0xec : 0x11);
  }
  return result;
}

function addErrorCorrection(dataCodewords, version) {
  const totalCodewords = TOTAL_CODEWORDS[version - 1];
  const eccLength = ECC_TOTAL_CODEWORDS_L[version - 1] / ECC_BLOCKS_L[version - 1];
  const blockCount = ECC_BLOCKS_L[version - 1];
  const longBlockCount = totalCodewords % blockCount;
  const shortBlockTotalLength = Math.floor(totalCodewords / blockCount);
  const shortDataLength = shortBlockTotalLength - eccLength;
  const blocks = [];
  let offset = 0;

  for (let i = 0; i < blockCount; i += 1) {
    const dataLength = shortDataLength + (i >= blockCount - longBlockCount ? 1 : 0);
    const data = dataCodewords.slice(offset, offset + dataLength);
    offset += dataLength;
    blocks.push({
      data,
      ecc: reedSolomonRemainder(data, eccLength),
    });
  }

  const result = [];
  const maxDataLength = Math.max(...blocks.map((block) => block.data.length));
  for (let i = 0; i < maxDataLength; i += 1) {
    blocks.forEach((block) => {
      if (i < block.data.length) result.push(block.data[i]);
    });
  }
  for (let i = 0; i < eccLength; i += 1) {
    blocks.forEach((block) => result.push(block.ecc[i]));
  }
  return result;
}

function drawFunctionPatterns(version, modules, functions, setFunctionModule) {
  const size = modules.length;
  drawFinderPattern(3, 3, size, setFunctionModule);
  drawFinderPattern(size - 4, 3, size, setFunctionModule);
  drawFinderPattern(3, size - 4, size, setFunctionModule);

  for (let i = 0; i < size; i += 1) {
    if (!functions[6][i]) setFunctionModule(i, 6, i % 2 === 0);
    if (!functions[i][6]) setFunctionModule(6, i, i % 2 === 0);
  }

  const alignments = getAlignmentPatternPositions(version);
  alignments.forEach((x) => {
    alignments.forEach((y) => {
      const overlapsFinder =
        (x === 6 && y === 6) ||
        (x === 6 && y === size - 7) ||
        (x === size - 7 && y === 6);
      if (!overlapsFinder) drawAlignmentPattern(x, y, setFunctionModule);
    });
  });

  drawFormatBits(size, setFunctionModule);
  setFunctionModule(8, size - 8, true);
  if (version >= 7) drawVersionBits(version, size, setFunctionModule);
}

function drawFinderPattern(cx, cy, size, setFunctionModule) {
  for (let dy = -4; dy <= 4; dy += 1) {
    for (let dx = -4; dx <= 4; dx += 1) {
      const x = cx + dx;
      const y = cy + dy;
      if (x < 0 || x >= size || y < 0 || y >= size) continue;
      const distance = Math.max(Math.abs(dx), Math.abs(dy));
      setFunctionModule(x, y, distance !== 2 && distance !== 4);
    }
  }
}

function drawAlignmentPattern(cx, cy, setFunctionModule) {
  for (let dy = -2; dy <= 2; dy += 1) {
    for (let dx = -2; dx <= 2; dx += 1) {
      setFunctionModule(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
    }
  }
}

function getAlignmentPatternPositions(version) {
  if (version === 1) return [];
  const size = version * 4 + 17;
  const count = Math.floor(version / 7) + 2;
  const step = version === 32 ? 26 : Math.ceil((size - 13) / (count * 2 - 2)) * 2;
  const result = [6];
  for (let pos = size - 7; result.length < count; pos -= step) {
    result.splice(1, 0, pos);
  }
  return result;
}

function drawCodewords(modules, functions, codewords) {
  const size = modules.length;
  let bitIndex = 0;
  let upward = true;

  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right -= 1;
    for (let vert = 0; vert < size; vert += 1) {
      const y = upward ? size - 1 - vert : vert;
      for (let j = 0; j < 2; j += 1) {
        const x = right - j;
        if (functions[y][x]) continue;
        let dark = false;
        if (bitIndex < codewords.length * 8) {
          dark = ((codewords[Math.floor(bitIndex / 8)] >>> (7 - (bitIndex % 8))) & 1) !== 0;
          bitIndex += 1;
        }
        if ((x + y) % 2 === 0) dark = !dark;
        modules[y][x] = dark;
      }
    }
    upward = !upward;
  }
}

function drawFormatBits(size, setFunctionModule) {
  const bits = getFormatBits();
  for (let i = 0; i <= 5; i += 1) setFunctionModule(8, i, getBit(bits, i));
  setFunctionModule(8, 7, getBit(bits, 6));
  setFunctionModule(8, 8, getBit(bits, 7));
  setFunctionModule(7, 8, getBit(bits, 8));
  for (let i = 9; i < 15; i += 1) setFunctionModule(14 - i, 8, getBit(bits, i));
  for (let i = 0; i < 8; i += 1) setFunctionModule(size - 1 - i, 8, getBit(bits, i));
  for (let i = 8; i < 15; i += 1) setFunctionModule(8, size - 15 + i, getBit(bits, i));
}

function getFormatBits() {
  const data = (FORMAT_ECC_L << 3) | MASK_PATTERN;
  let bits = data << 10;
  for (let i = 14; i >= 10; i -= 1) {
    if (((bits >>> i) & 1) !== 0) bits ^= 0x537 << (i - 10);
  }
  return ((data << 10) | (bits & 0x3ff)) ^ 0x5412;
}

function drawVersionBits(version, size, setFunctionModule) {
  const bits = getVersionBits(version);
  for (let i = 0; i < 18; i += 1) {
    const bit = getBit(bits, i);
    const a = size - 11 + (i % 3);
    const b = Math.floor(i / 3);
    setFunctionModule(a, b, bit);
    setFunctionModule(b, a, bit);
  }
}

function getVersionBits(version) {
  let bits = version << 12;
  for (let i = 17; i >= 12; i -= 1) {
    if (((bits >>> i) & 1) !== 0) bits ^= 0x1f25 << (i - 12);
  }
  return (version << 12) | (bits & 0xfff);
}

function reedSolomonRemainder(data, degree) {
  const generator = reedSolomonGenerator(degree);
  const result = [...data, ...new Array(degree).fill(0)];
  data.forEach((_, i) => {
    const factor = result[i];
    if (factor === 0) return;
    generator.forEach((coef, j) => {
      result[i + j] ^= gfMultiply(coef, factor);
    });
  });
  return result.slice(data.length);
}

function reedSolomonGenerator(degree) {
  let result = [1];
  for (let i = 0; i < degree; i += 1) {
    result = polyMultiply(result, [1, gfPow(2, i)]);
  }
  return result;
}

function polyMultiply(a, b) {
  const result = new Array(a.length + b.length - 1).fill(0);
  a.forEach((av, i) => {
    b.forEach((bv, j) => {
      result[i + j] ^= gfMultiply(av, bv);
    });
  });
  return result;
}

function gfPow(value, power) {
  let result = 1;
  for (let i = 0; i < power; i += 1) result = gfMultiply(result, value);
  return result;
}

function gfMultiply(a, b) {
  let result = 0;
  let x = a;
  let y = b;
  while (y) {
    if (y & 1) result ^= x;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
    y >>>= 1;
  }
  return result & 0xff;
}

function appendBits(bits, value, length) {
  for (let i = length - 1; i >= 0; i -= 1) bits.push((value >>> i) & 1);
}

function makeMatrix(size, value) {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => value));
}

function getBit(value, index) {
  return ((value >>> index) & 1) !== 0;
}

function encodeUtf8(text) {
  if (typeof TextEncoder !== "undefined") {
    return Array.from(new TextEncoder().encode(text));
  }
  const encoded = encodeURIComponent(text);
  const bytes = [];
  for (let i = 0; i < encoded.length; i += 1) {
    if (encoded[i] === "%") {
      bytes.push(parseInt(encoded.slice(i + 1, i + 3), 16));
      i += 2;
    } else {
      bytes.push(encoded.charCodeAt(i));
    }
  }
  return bytes;
}
