"use strict";

const fs = require("fs");
const { fork } = require("child_process");
const args = require("minimist")(process.argv.slice(2), {
	string: ["data", "tests", "kind"],
	default: {
		data: "1.small.json",
		chunkSize: 16 * 1024,
		kind: 'deflate'
	}
});

const testsDir = `./tests_${args.kind}`;
const filter = args.tests ? args.tests.split(",") : [];
const tests = fs.readdirSync(testsDir).filter(t => (filter.length ? filter.some(s => t.startsWith(`${s}.`)) : true)).sort((a, b) => a.split(".")[0] - b.split(".")[0]);

try {
	fs.readFileSync(`./data/${args.data}`);
} catch(e) {
	throw new Error(`test file ${args.data} not found, aborting...`);
}

console.log(`Benchmarking ${args.data}`);

(async () => {
	for(const test of tests) {
		await new Promise(r => {
			const c = fork(`${testsDir}/${test}`, [JSON.stringify(args)]);
			c.on("exit", () => {
				setTimeout(() => r(), 1000);
			});
		});
	}
})();
