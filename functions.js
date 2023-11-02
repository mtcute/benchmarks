"use strict";

const chars = "1234567890 abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function dev(avg, array) {
	return Math.sqrt(array.map(t => (t - avg) ** 2).reduce((a, t) => a + t, 0) / array.length);
}

function randomChar() {
	return chars[Math.floor(Math.random() * chars.length)];
}

function r(obj) {
	const keys = Object.keys(obj);
	for(const key of keys) {
		switch(typeof obj[key]) {
			case "object":
				r(obj[key]);
				break;
			case "number":
				obj[key] = Math.random();
				break;
			case "string":
				obj[key] = new Array(Math.round(obj[key].length * (Math.random() * 3))).fill().map(randomChar).join("");
				break;
		}
	}
}

function randomize(data) {
	try {
		const o = JSON.parse(data);
		r(o);
		return JSON.stringify(o);
	} catch(e) {
		return data;
	}
}

function randomizeBuffer(data) {
	return Buffer.from(randomize(data));
}

function randomizeCrypto(data, needUint8 = false) {
	const MIN_SIZE = 64 // 32 bytes key + 32 bytes iv
	data = randomize(data)

	const padSize = 16 - (data.length % 16);
	let buf = Buffer.allocUnsafe(Math.max(data.length + padSize, MIN_SIZE));
	buf.set(Buffer.from(data));

	if (needUint8) {
		buf = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength)
	}

	const key = buf.slice(0, 32);
	const iv = buf.slice(32, 64);
	return [buf, key, iv];
}

module.exports = {
	dev,
	randomize,
	randomizeBuffer,
	randomizeCrypto
};
