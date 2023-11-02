/* eslint-disable */
// const fs = require('fs')
// const path = require('path')

import fs from 'fs'
import path from 'path'
import url from 'url'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

const wasmBuffer = fs.readFileSync(path.join(__dirname, 'clamav-sha256.wasm'))

const wasm = await WebAssembly.instantiate(wasmBuffer)

const {
    memory,
    __malloc,
    __free,
    sha256_easy_hash,
} = wasm.instance.exports

let cachedUint8Memory0 = null;

function getUint8Memory0() {
    if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
        cachedUint8Memory0 = new Uint8Array(memory.buffer);
    }
    return cachedUint8Memory0;
}

export function sha256(bytes) {
    const outputPtr = __malloc(32)
    const inputPtr = __malloc(bytes.length)
    getUint8Memory0().set(bytes, inputPtr)

    sha256_easy_hash(inputPtr, bytes.length, outputPtr)
    const result = getUint8Memory0().slice(outputPtr, outputPtr + 32)

    __free(inputPtr)
    __free(outputPtr)
    return result
}