"use strict";

const { performance } = require("perf_hooks");
const fs = require("fs");
const functions = require("../functions.js");

const { CTR } = require('@cryptography/aes')

const args = JSON.parse(process.argv[2]);
const dat = fs.readFileSync(`./data/${args.data}`, "utf8");

function wordsToBytes(words) {
    const o = Buffer.alloc(words.byteLength)

    const len = words.length * 4

    for (let i = 0; i < len; ++i) {
        o[i] = ((words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff)
    }

    return o
}

const warmup = performance.now();
while(performance.now() < warmup + 2000) {
	const [data, key, iv] = functions.randomizeCryptoCtr(dat);
	const enc = new CTR(key, iv)
	const c = enc.encrypt(data);
	const dec = new CTR(key, iv)
	const d = dec.decrypt(c);
	if(wordsToBytes(d).toString() !== data.toString()) { throw new Error("data validation failed"); }
}

const result1 = [];
const result2 = [];
const result4 = [];
let total = 0;
let ops = 0;
const run = performance.now();
while(performance.now() < run + 10000) {
	const s1 = [];
	const s2 = [];
	const s4 = [];
	const sample = performance.now();
	while(performance.now() < sample + 1000) {
		const [data, key, iv] = functions.randomizeCryptoCtr(dat);
		s4.push(data.length);
		let t = performance.now();
		const enc = new CTR(key, iv)
		const c = enc.encrypt(data);
		s1.push(performance.now() - t);
		t = performance.now();
		const dec = new CTR(key, iv)
		const d = dec.decrypt(c);
		s2.push(performance.now() - t);
		if(wordsToBytes(d).toString() !== data.toString()) { throw new Error("data validation failed"); }
		ops++;
	}
	result1.push(1000 / (s1.reduce((a, t) => a + t, 0) / s1.length));
	result2.push(1000 / (s2.reduce((a, t) => a + t, 0) / s2.length));
	result4.push(s4.reduce((a, t) => a + t, 0) / s4.length);
	total += s4.reduce((a, t) => a + t, 0);
}

const time = (performance.now() - run) / 1000;
const avg1 = result1.reduce((a, t) => a + t, 0) / result1.length;
const avg2 = result2.reduce((a, t) => a + t, 0) / result2.length;
const avg4 = result4.reduce((a, t) => a + t, 0) / result4.length;
const dev1 = functions.dev(avg1, result1);
const dev2 = functions.dev(avg2, result2);
const ram = (process.memoryUsage().rss / 1024 / 1024).toFixed(2);

console.log(`\n${__filename.slice(__dirname.length + 1).slice(0, -3)}`);
console.log(`ctr256_encrypt x ${avg1.toFixed(2)} ops/sec ± ${dev1.toFixed(2)} (${(avg4 * avg1 / 1024 / 1024).toFixed(3)} MB/s)`);
console.log(`ctr256_decrypt x ${avg2.toFixed(2)} ops/sec ± ${dev2.toFixed(2)} (${(avg4 * avg2 / 1024 / 1024).toFixed(3)} MB/s)`);
console.log(`Sampled ${ops} chunks (${(total / 1024 / 1024).toFixed(3)} MB) in ${time.toFixed(3)} seconds`);
console.log(`Average memory usage: ${ram} MB`);