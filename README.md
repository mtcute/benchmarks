# mtcute benchmarks

Benchmarks comparing deflate and aes libraries performance 
in regards to features used in Telegram's MTProto protocol.

## Tested Libraries

### Deflate
1. [zlib](https://nodejs.org/api/zlib.html) (built-in Node.js zlib module)
2. [fast-zlib 2.0.1](https://github.com/timotejroiko/fast-zlib) (shared-context zlib wrapper)
3. [zlib-sync 0.1.9](https://github.com/abalabahaha/zlib-sync) (zlib built as a Node.js addon)
4. [pako 2.1.0](https://github.com/nodeca/pako) (pure JS zlib implementation)
5. @mtcute/crypto-node 0.1.1 (basically libdeflate built as a Node.js addon)
6. @mtcute/wasm (optimized for size bundle of libdeflate WASM blob)
7. [miniz_oxide](https://crates.io/crates/miniz_oxide) (Rust implementation built as a wasm)

### AES IGE
1. [@mtcute/crypto-node 0.1.0](https://github.com/mtcute/mtcute/blob/v0.1.0/packages/crypto-node/README.md) (pure C implementation built as a Node.js addon)
2. [@cryptography/aes 0.1.1](https://github.com/spalt08/cryptography) (as seen in official Web clients)
3. [@mtcute/core 0.1.0](https://github.com/mtcute/mtcute/blob/v0.1.0/packages/core/src/utils/crypto/common.ts) (ECB-agnostic pure JS implementation)
4. @mtcute/wasm (pure C implementation built as a WASM blob)
5. @mtcute/crypto-node 0.1.1 (OpenSSL-based native IGE implementation, built as a Node.js addon)

## Usage

```bash
git clone --recursive https://github.com/mtcute/benchmarks
npm ci
./build-vendor.sh

node ./benchmark-all.js > results.md
node ./benchmark --kind deflate
```

## Notes

* Each test is run in a dedicated child process
* Each test does a 2 second warmup run before starting
* The test consists of 10 runs of 1 second each in order to obtain an average and a standard deviation
* Average memory usage is obtained from `process.memoryUsage().rss` in the child process at the end of the test. This is only a rough estimate and may not reflect real world memory usage
* The tested data consists of a supplied json file with randomized values on each chunk in order to approximate real world usage.

## Results

Tested on an AMD Ryzen 7 5700U 1.8ghz running Node.js v18.17.1 and NixOS.

See [results.md](./results.md) for full results. 

### TLDR - Deflate
- pako (Pure JS) is **slow**
- libdeflate is **fast**, especially when compiled to native code (since it uses platform-specific magic)
- wasm is cool

### TLDR - AES IGE
- old mtcute pure JS crypto is **slow**
- `@cryptography/aes` is fast enough to be a viable alternative to wasm
- `@mtcute/wasm` is **fast** and **small**
- openssl is **insanely fast**, except on tiny payloads, likely due to context initialization overhead

