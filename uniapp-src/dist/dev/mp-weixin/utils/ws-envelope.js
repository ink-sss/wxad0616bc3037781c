"use strict";
let signKey = "";
let seenNonces = /* @__PURE__ */ new Set();
function rightRotate(value, amount) {
  return value >>> amount | value << 32 - amount;
}
function utf8Bytes(text = "") {
  const bytes = [];
  const value = String(text);
  for (let i = 0; i < value.length; i += 1) {
    let code = value.charCodeAt(i);
    if (code < 128) {
      bytes.push(code);
    } else if (code < 2048) {
      bytes.push(192 | code >> 6, 128 | code & 63);
    } else if (code >= 55296 && code <= 56319) {
      i += 1;
      code = 65536 + ((code & 1023) << 10 | value.charCodeAt(i) & 1023);
      bytes.push(
        240 | code >> 18,
        128 | code >> 12 & 63,
        128 | code >> 6 & 63,
        128 | code & 63
      );
    } else {
      bytes.push(224 | code >> 12, 128 | code >> 6 & 63, 128 | code & 63);
    }
  }
  return bytes;
}
function bytesToHex(bytes = []) {
  return bytes.map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
function sha256Bytes(inputBytes = []) {
  const k = [
    1116352408,
    1899447441,
    3049323471,
    3921009573,
    961987163,
    1508970993,
    2453635748,
    2870763221,
    3624381080,
    310598401,
    607225278,
    1426881987,
    1925078388,
    2162078206,
    2614888103,
    3248222580,
    3835390401,
    4022224774,
    264347078,
    604807628,
    770255983,
    1249150122,
    1555081692,
    1996064986,
    2554220882,
    2821834349,
    2952996808,
    3210313671,
    3336571891,
    3584528711,
    113926993,
    338241895,
    666307205,
    773529912,
    1294757372,
    1396182291,
    1695183700,
    1986661051,
    2177026350,
    2456956037,
    2730485921,
    2820302411,
    3259730800,
    3345764771,
    3516065817,
    3600352804,
    4094571909,
    275423344,
    430227734,
    506948616,
    659060556,
    883997877,
    958139571,
    1322822218,
    1537002063,
    1747873779,
    1955562222,
    2024104815,
    2227730452,
    2361852424,
    2428436474,
    2756734187,
    3204031479,
    3329325298
  ];
  const bytes = inputBytes.slice();
  const bitLength = bytes.length * 8;
  bytes.push(128);
  while (bytes.length % 64 !== 56)
    bytes.push(0);
  const high = Math.floor(bitLength / 4294967296);
  const low = bitLength >>> 0;
  bytes.push(high >>> 24 & 255, high >>> 16 & 255, high >>> 8 & 255, high & 255);
  bytes.push(low >>> 24 & 255, low >>> 16 & 255, low >>> 8 & 255, low & 255);
  const h = [1779033703, 3144134277, 1013904242, 2773480762, 1359893119, 2600822924, 528734635, 1541459225];
  const w = new Array(64);
  for (let offset = 0; offset < bytes.length; offset += 64) {
    for (let i = 0; i < 16; i += 1) {
      const index = offset + i * 4;
      w[i] = (bytes[index] << 24 | bytes[index + 1] << 16 | bytes[index + 2] << 8 | bytes[index + 3]) >>> 0;
    }
    for (let i = 16; i < 64; i += 1) {
      const s0 = (rightRotate(w[i - 15], 7) ^ rightRotate(w[i - 15], 18) ^ w[i - 15] >>> 3) >>> 0;
      const s1 = (rightRotate(w[i - 2], 17) ^ rightRotate(w[i - 2], 19) ^ w[i - 2] >>> 10) >>> 0;
      w[i] = w[i - 16] + s0 + w[i - 7] + s1 >>> 0;
    }
    let [a, b, c, d, e, f, g, hh] = h;
    for (let i = 0; i < 64; i += 1) {
      const s1 = (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) >>> 0;
      const ch = (e & f ^ ~e & g) >>> 0;
      const temp1 = hh + s1 + ch + k[i] + w[i] >>> 0;
      const s0 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) >>> 0;
      const maj = (a & b ^ a & c ^ b & c) >>> 0;
      const temp2 = s0 + maj >>> 0;
      hh = g;
      g = f;
      f = e;
      e = d + temp1 >>> 0;
      d = c;
      c = b;
      b = a;
      a = temp1 + temp2 >>> 0;
    }
    h[0] = h[0] + a >>> 0;
    h[1] = h[1] + b >>> 0;
    h[2] = h[2] + c >>> 0;
    h[3] = h[3] + d >>> 0;
    h[4] = h[4] + e >>> 0;
    h[5] = h[5] + f >>> 0;
    h[6] = h[6] + g >>> 0;
    h[7] = h[7] + hh >>> 0;
  }
  const output = [];
  h.forEach((word) => {
    output.push(word >>> 24 & 255, word >>> 16 & 255, word >>> 8 & 255, word & 255);
  });
  return output;
}
function hmacSha256Hex(key, message) {
  let keyBytes = utf8Bytes(key);
  if (keyBytes.length > 64)
    keyBytes = sha256Bytes(keyBytes);
  while (keyBytes.length < 64)
    keyBytes.push(0);
  const outer = keyBytes.map((byte) => byte ^ 92);
  const inner = keyBytes.map((byte) => byte ^ 54);
  return bytesToHex(sha256Bytes(outer.concat(sha256Bytes(inner.concat(utf8Bytes(message))))));
}
function generateNonce() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}
function setSignKey(key = "") {
  signKey = key || "";
}
function unwrapMessage(data) {
  if (!data || typeof data !== "object")
    return data;
  if (typeof data.v === "number" && data.payload !== void 0) {
    if (data.nonce) {
      if (seenNonces.has(data.nonce))
        return null;
      seenNonces.add(data.nonce);
      if (seenNonces.size > 5e3) {
        const list = Array.from(seenNonces);
        seenNonces = new Set(list.slice(list.length - 2e3));
      }
    }
    return data.payload;
  }
  return data;
}
function wrapMessage(payload = {}, key = signKey) {
  const payloadText = JSON.stringify(payload);
  if (!key)
    return payloadText;
  const ts = Date.now();
  const nonce = generateNonce();
  const sig = hmacSha256Hex(key, payloadText + String(ts) + nonce);
  return JSON.stringify({
    v: 1,
    ts,
    nonce,
    payload,
    sig,
    enc: false
  });
}
exports.setSignKey = setSignKey;
exports.unwrapMessage = unwrapMessage;
exports.wrapMessage = wrapMessage;
