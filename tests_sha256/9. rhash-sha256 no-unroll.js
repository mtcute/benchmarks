"use strict";

const { performance } = require("perf_hooks");
const fs = require("fs");
const functions = require("../functions.js");

const crypto = require("crypto");
const cryptoSha256 = (data) => crypto.createHash('sha256').update(data).digest();

process.env.WASM_NO_UNROLL = 1
import("../vendor/wasm/rhash-sha256.mjs").then((wasm) => {
const args = JSON.parse(process.argv[2]);
const dat = fs.readFileSync(`./data/${args.data}`, "utf8");

const warmup = performance.now();
while(performance.now() < warmup + 2000) {
	const data = functions.randomizeBuffer(dat);
	const res = wasm.sha256(data);
	if (Buffer.compare(res, cryptoSha256(data)) !== 0) throw new Error("data validation failed");
}

const result1 = [];
const result4 = [];
let total = 0;
let ops = 0;
const run = performance.now();
while(performance.now() < run + 10000) {
	const s1 = [];
	const s4 = [];
	const sample = performance.now();
	while(performance.now() < sample + 1000) {
		const data = functions.randomizeBuffer(dat);
		s4.push(data.length);
		let t = performance.now();
		wasm.sha256(data);
		s1.push(performance.now() - t);
		ops++;
		const res = wasm.sha256(data);
		if (Buffer.compare(res, cryptoSha256(data)) !== 0) throw new Error("data validation failed");
	}
	result1.push(1000 / (s1.reduce((a, t) => a + t, 0) / s1.length));
	result4.push(s4.reduce((a, t) => a + t, 0) / s4.length);
	total += s4.reduce((a, t) => a + t, 0);
}

const time = (performance.now() - run) / 1000;
const avg1 = result1.reduce((a, t) => a + t, 0) / result1.length;
const avg4 = result4.reduce((a, t) => a + t, 0) / result4.length;
const dev1 = functions.dev(avg1, result1);
const ram = (process.memoryUsage().rss / 1024 / 1024).toFixed(2);

console.log(`\n${__filename.slice(__dirname.length + 1).slice(0, -3)}`);
console.log(`sha256 x ${avg1.toFixed(2)} ops/sec ± ${dev1.toFixed(2)} (${(avg4 * avg1 / 1024 / 1024).toFixed(3)} MB/s)`);
console.log(`Sampled ${ops} chunks (${(total / 1024 / 1024).toFixed(3)} MB) in ${time.toFixed(3)} seconds`);
console.log(`Average memory usage: ${ram} MB`);
})