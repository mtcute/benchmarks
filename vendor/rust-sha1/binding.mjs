/* eslint-disable */
// const fs = require('fs')
// const path = require('path')

import fs from 'fs'
import path from 'path'
import url from 'url'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

const wasmBuffer = fs.readFileSync(path.join(__dirname, 'sha1-digest.wasm'))

const wasm = await WebAssembly.instantiate(wasmBuffer)

const {
    memory,
    alloc,
    dealloc,
    digest,
} = wasm.instance.exports

let cachedUint8Memory0 = null;

function getUint8Memory0() {
    if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
        cachedUint8Memory0 = new Uint8Array(memory.buffer);
    }
    return cachedUint8Memory0;
}

export function sha1(bytes) {
    const inputPtr = alloc(bytes.length + 1)
    const u8 = getUint8Memory0()
    u8.set(bytes, inputPtr)
    u8[inputPtr + bytes.length] = 0

    const outPtr = digest(inputPtr)
    const result = getUint8Memory0().slice(outPtr, outPtr + 40)

    dealloc(inputPtr)
    // what the fuck
    return Buffer.from(Buffer.from(result).toString(), 'hex')
}

if (import.meta.url.startsWith('file:')) {
    const modulePath = new URL(import.meta.url).pathname;

    if (process.argv[1] === modulePath) {
        console.log('correct: e02aa1b106d5c7c6a98def2b13005d5b84fd8dc8')
        console.log('result1:', Buffer.from(sha1(Buffer.from('Hello, world'))).toString('hex'))
        console.log('result2:', Buffer.from(sha1(Buffer.from('Hello, world'))).toString('hex'))
    }
}  