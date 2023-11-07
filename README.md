# mtcute benchmarks

Benchmarks comparing deflate and aes libraries performance 
in regards to features used in Telegram's MTProto protocol.

## Tested Libraries

Bundle size is measured using [bundlejs](https://bundlejs.com/) for JS libraries,
and by measuring the size of the WASM blob for WASM libraries. Size of the JS
wrapper is usually negligible, so it is not included in the table.

Value before the `->` is the rendered size, after is the gzipped size

For WASM libraries, we actually build two blobs and compare them separately: 
one with `-fno-unroll` and `-fno-inline` flags (marked with NU in the table), and one without. 
These flags slightly increase the size of the blob, but also improve performance, 
so we want to see if it's worth it.

### Deflate & Gunzip
| Library                                              | kind    | Version | Bundle size      | Notes                                            |
| ---------------------------------------------------- | ------- | ------- | ---------------- | ------------------------------------------------ |
| zlib                                                 | Native  | N/A     | N/A              | built-in Node.js zlib module                     |
| fast-zlib                                            | Native  | 2.0.1   | N/A              | shared-context zlib wrapper                      |
| [pako](https://npm.im/pako)                          | JS      | 2.1.0   | 47.4Ki -> 15.1Ki | pure JS zlib implementation                      |
| [libdeflate](https://github.com/ebiggers/libdeflate) | WASM    | N/A     | 43.6Ki -> 16.9Ki | pure C deflate (and derivatives) built as a wasm |
| [libdeflate](https://github.com/ebiggers/libdeflate) | WASM NU | N/A     | 25.3Ki -> 12.0Ki | pure C deflate (and derivatives) built as a wasm |
| miniz_oxide                                          | WASM    | 0.4.4   | 55.6Ki -> 24.4Ki | Rust implementation built as a wasm              |

> We're only interested in zlib deflating, since Telegram only allows it for uploads,
> and sends all incoming `gzip_packed` as gzip-encoded data.
> Since it's faster, simpler and more memory-efficient, we prefer it over gzip.

### AES IGE
| Library                                                      | kind    | Version | Bundle size      | Notes                                             |
| ------------------------------------------------------------ | ------- | ------- | ---------------- | ------------------------------------------------- |
| [tgcrypto](https://github.com/pyrogram/tgcrypto)             | Native  | N/A     | N/A              | tgcrypto built as a Node native addon             |
| [@cryptography/aes](https://github.com/spalt08/cryptography) | JS      | 0.1.1   | 4.83Ki -> 1.61Ki | as seen in official Web clients                   |
| [tgcrypto](https://github.com/pyrogram/tgcrypto)             | WASM    | N/A     | 21.9Ki -> 10.6Ki | tgcrypto built as a WASM blob                     |
| [tgcrypto](https://github.com/pyrogram/tgcrypto)             | WASM NU | N/A     | 19.2Ki -> 9.6Ki  | tgcrypto built as a WASM blob                     |
| OpenSSL-based IGE                                            | Native  | N/A     | N/A              | IGE built using OpenSSL primitives (native addon) |

### AES CTR
| Library                                                      | kind    | Version | Bundle size      | Notes                                 |
| ------------------------------------------------------------ | ------- | ------- | ---------------- | ------------------------------------- |
| OpenSSL                                                      | Native  | N/A     | N/A              | Node built-in crypto module           |
| [@cryptography/aes](https://github.com/spalt08/cryptography) | JS      | 0.1.1   | 4.83Ki -> 1.61Ki | as seen in official Web clients       |
| [tgcrypto](https://github.com/pyrogram/tgcrypto)             | WASM    | N/A     | 21.9Ki -> 10.6Ki | tgcrypto built as a WASM blob         |
| [tgcrypto](https://github.com/pyrogram/tgcrypto)             | WASM NU | N/A     | 19.2Ki -> 9.6Ki  | tgcrypto built as a WASM blob         |

### SHA256
| Library                                                           | kind    | Version | Bundle size     | Notes                             |
| ----------------------------------------------------------------- | ------- | ------- | --------------- | --------------------------------- |
| openssl                                                           | Native  | N/A     | N/A             | built-in Node.js crypto module    |
| WebCrypto                                                         | Native  | N/A     | N/A             | built-in WebCrypto implementation |
| [sha256-uint8array](https://github.com/kawanet/sha256-uint8array) | JS      | 0.10.7  | 3.6Ki -> 1.92Ki |                                   |
| [lekkit/sha256](https://github.com/LekKit/sha256)                 | WASM    | N/A     | 2.8Ki -> 1.5Ki  |                                   |
| [lekkit/sha256](https://github.com/LekKit/sha256)                 | WASM NU | N/A     | 1.8Ki -> 1.3Ki  |                                   |
| [clamav/sha256]                                                   | WASM    | N/A     | 7.6Ki -> 2.3Ki  |                                   |
| [clamav/sha256]                                                   | WASM NU | N/A     | 6.7Ki -> 2.2Ki  |                                   |
| [rhash](https://github.com/rhash/RHash)                           | WASM    | N/A     | 9.2Ki -> 3.4Ki  |                                   |
| [rhash](https://github.com/rhash/RHash)                           | WASM NU | N/A     | 9.2Ki -> 3.4Ki  |                                   |

[clamav/sha256]: https://opensource.apple.com/source/clamav/clamav-158/clamav.Bin/clamav-0.98/libclamav/sha256.c.auto.html

### SHA1
| Library                                              | kind    | Version | Bundle size      | Notes                                                  |
| ---------------------------------------------------- | ------- | ------- | ---------------- | ------------------------------------------------------ |
| openssl                                              | Native  | N/A     | N/A              | built-in Node.js crypto module                         |
| WebCrypto                                            | Native  | N/A     | N/A              | built-in WebCrypto implementation                      |
| [rusha](https://github.com/srijs/rusha)              | JS      | 0.8.14  | 13Ki -> 4.59Ki   | *High-performance pure-javascript SHA1 implementation* |
| rust-sha1                                            | WASM    | idk     | 43.1Ki -> 18.3Ki | [sha1 crate](https://crates.io/crates/sha1)            |
| [clibs/sha1](https://github.com/clibs/sha1)          | WASM    | N/A     | 5.8Ki -> 2.3Ki   |                                                        |
| [clibs/sha1](https://github.com/clibs/sha1)          | WASM NU | N/A     | 5.3Ki -> 2.2Ki   |                                                        |
| [teeny-sha1](https://github.com/CTrabant/teeny-sha1) | WASM    | N/A     | 1.7Ki -> 1017B   |                                                        |
| [teeny-sha1](https://github.com/CTrabant/teeny-sha1) | WASM NU | N/A     | 1.5Ki -> 1011B   |                                                        |

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
* Bundle size is also considered, since it is important for web clients

### Data

> approximate, since it is randomized
- 0.tiny.json: 36-60 (avg 47.987) bytes
- 1.small.json: 267-622 (avg 443.028) bytes
- 2.medium.json: 9674-15811 (avg 13029.129) bytes
- 3.large.json: 71587-74048 (avg 72742.067) bytes
- 4.verylarge.json: 541877-549104 (avg 545060.348) bytes

### Usage data

It is very important not to benchmark in a vacuum, so I also gathered some usage data from
the actual clients, and estimated the average payload size for each type of request.

- SHA1 - Almost never used in MTProto 2.0, except for:
  - initial authorization (mostly tiny payloads ⩽ 256b)
  - `auth_key_id` derivation (256 bytes)
  - public key fp calculation (~270b)
  - MTProto 1.0 stuff (for PFS, also tiny payloads ⩽ 80b)
- SHA256 - Extensively used in MTProto 2.0, particularly for:
  - `msg_key` derivation (the entire message is hashed, so up to 1mb, but usually around 1kb. 
    AES-IGE section below applies here too, since the same message will be en/decrypted)
  - IGE key/iv derivation (always exactly 52 bytes)
  - `RSA_PAD` function (inner data is around 250 bytes)
  - initial payload for obfuscated transport over MTProxy (32b + proxy secret)
  - SRP params for 2fa passwords
  - As an underlying hash for HMAC for fake-tls MTProxies

For other algos, see [logs/](./logs/) for more info. TLDR:

#### Normal user (WebA)
> ~4 hours, semi-active usage on a personal account
- AES-CTR: 75% of calls are ⩽ 2kb, 90% are ⩽ 10kb, 99% are ⩽ 132kb (max 525kb)
- AES-IGE:
  - encrypt: 75% of calls are 112-192b, 90% are 80-300b, 99% are ⩽ 1kb (max 525kb)
  - decrypt: 99% of calls are 64b-132kb (median 160b, max 136kb)
- deflate: [not used in weba]
- gunzip: 75% of calls are ⩽ 18kb, 90% are ⩽ 28kb, 99% are ⩽ 58kb (max 136kb)

#### Highload bot (idle, mtcute)
> ~5 minutes, 100% idle, 0 messages/files/etc. sent
- AES-CTR: [not used outside browser]
- AES-IGE:
  - encrypt: 100% of calls are ⩽ 1kb (median 176b)
  - decrypt: 99% of calls are ⩽ 1kb (max 5kb)
- deflate: [not enough data]
- gunzip: 99% of calls are ⩽ 1kb (max 5kb)

So we should primarily optimize for small payloads (the `tiny` and `small` files), 
as they are the most common, and larger ones are only primarily used for file uploads/downloads,
which is anyways capped by the server at around 40-50 mib/s

## Results

Tested on an AMD Ryzen 7 5700U 1.8ghz running Node.js v18.17.1 and NixOS.

See [results.md](./results.md) for full results. 

### TLDR

With everything considered, the best option for mtcute is to:
- for node, prefer native crypto or addons
- otherwise, fallback to wasm with:
  - sha1: all packages are *fast enough*, so we'll use teeny-sha1 for it's small size
    (and also it has better performance on small payloads)
  - sha256: same, all packages are *fast enough*, so we'll use lekkit/sha256 for it's small size
  - aes ige/ctr - pretty much no other options, so we'll use tgcrypto
  - deflate - same, so we'll use libdeflate
  - unrolling is not worth it, since the performance gain is negligible

