/* eslint-disable */
// const fs = require('fs')
// const path = require('path')

import fs from 'fs'
import path from 'path'
import url from 'url'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

const wasmBuffer = fs.readFileSync(path.join(__dirname, 'mtcute-wasm.wasm'))

const wasm = await WebAssembly.instantiate(wasmBuffer)

const {
    memory,
    __malloc,
    __free,
    libdeflate_alloc_decompressor,
    libdeflate_alloc_compressor,
    libdeflate_zlib_decompress,
    libdeflate_zlib_compress,
    ige256_encrypt,
    ige256_decrypt,
} = wasm.instance.exports
let cachedUint8Memory0 = null;
let cachedDataView = null;
let cachedCompressor = null;
let cachedDecompressor = null;
let sharedOutSizePtr = null

function getUint8Memory0() {
    if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
        cachedUint8Memory0 = new Uint8Array(memory.buffer);
    }
    return cachedUint8Memory0;
}

function getCompressor() {
    if (cachedCompressor === null) {
        cachedCompressor = libdeflate_alloc_compressor(1)
    }

    return cachedCompressor
}

function getDecompressor() {
    if (cachedDecompressor === null) {
        cachedDecompressor = libdeflate_alloc_decompressor()
    }

    return cachedDecompressor
}

function getOutSizePtr() {
    if (sharedOutSizePtr === null) {
        sharedOutSizePtr = __malloc(4)
    }

    return sharedOutSizePtr
}

export function deflateMaxSize(bytes, size) {
    const outputPtr = __malloc(size)
    const inputPtr = __malloc(bytes.length)
    getUint8Memory0().set(bytes, inputPtr)

    const written = libdeflate_zlib_compress(
        getCompressor(),
        inputPtr,
        bytes.length,
        outputPtr,
        size,
    )
    __free(inputPtr)

    if (written === 0) {
        __free(outputPtr)
        return null
    }

    const result = getUint8Memory0().slice(outputPtr, outputPtr + written)
    __free(outputPtr)
    return result
}

export function inflate(bytes, output) {
    const inputPtr = __malloc(bytes.length)
    const outputPtr = __malloc(output.length)
    getUint8Memory0().set(bytes, inputPtr)
    const outSizePtr = getOutSizePtr()

    const ret = libdeflate_zlib_decompress(
        getDecompressor(),
        inputPtr,
        bytes.length,
        outputPtr,
        output.length,
        outSizePtr,
    )
    __free(inputPtr)

    const written = new DataView(memory.buffer).getUint32(outSizePtr, true)

    if (ret !== 0 || written === 0) {
        __free(outputPtr)
        return 0
    }

    const result = getUint8Memory0().subarray(outputPtr, outputPtr + written)
    output.set(result)
    __free(outputPtr)
    return written
}

export function igeEncrypt(data, key, iv) {
    const inputPtr = __malloc(data.length)
    const outputPtr = __malloc(data.length)
    const keyPtr = __malloc(key.length)
    const ivPtr = __malloc(iv.length)

    const mem = getUint8Memory0()
    mem.set(data, inputPtr)
    mem.set(key, keyPtr)
    mem.set(iv, ivPtr)

    ige256_encrypt(inputPtr, data.length, keyPtr, ivPtr, outputPtr)

    const result = mem.slice(outputPtr, outputPtr + data.length)
    __free(inputPtr)
    __free(outputPtr)
    __free(keyPtr)
    __free(ivPtr)
    return result
}

export function igeDecrypt(data, key, iv) {
    const inputPtr = __malloc(data.length)
    const outputPtr = __malloc(data.length)
    const keyPtr = __malloc(key.length)
    const ivPtr = __malloc(iv.length)

    const mem = getUint8Memory0()
    mem.set(data, inputPtr)
    mem.set(key, keyPtr)
    mem.set(iv, ivPtr)

    ige256_decrypt(inputPtr, data.length, keyPtr, ivPtr, outputPtr)

    const result = mem.slice(outputPtr, outputPtr + data.length)
    __free(inputPtr)
    __free(outputPtr)
    __free(keyPtr)
    __free(ivPtr)
    return result
}

