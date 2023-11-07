/* eslint-disable */
import { wasm } from './_init.mjs'

import * as zlib from 'zlib'

const {
    memory,
    __malloc,
    __free,
    libdeflate_alloc_compressor,
    libdeflate_alloc_decompressor,
    libdeflate_zlib_compress,
    libdeflate_gzip_get_output_size,
    libdeflate_gzip_decompress,
} = wasm.instance.exports

const compressor = libdeflate_alloc_compressor(6)
const decompressor = libdeflate_alloc_decompressor()
let cachedUint8Memory0 = null;

function getUint8Memory0() {
    if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
        cachedUint8Memory0 = new Uint8Array(memory.buffer);
    }
    return cachedUint8Memory0;
}

export function deflateMaxSize(bytes, size) {
    const outputPtr = __malloc(size)
    const inputPtr = __malloc(bytes.length)
    getUint8Memory0().set(bytes, inputPtr)

    const written = libdeflate_zlib_compress(compressor, inputPtr, bytes.length, outputPtr, size)
    __free(inputPtr)

    if (written === 0) {
        __free(outputPtr)

        return null
    }

    const result = getUint8Memory0().slice(outputPtr, outputPtr + written)
    __free(outputPtr)

    return result
}

export function gunzip(bytes) {
    const inputPtr = __malloc(bytes.length)
    getUint8Memory0().set(bytes, inputPtr)

    const size = libdeflate_gzip_get_output_size(inputPtr, bytes.length)
    const outputPtr = __malloc(size)

    const ret = libdeflate_gzip_decompress(decompressor, inputPtr, bytes.length, outputPtr, size)

    if (ret === -1) throw new Error('gunzip error -- bad data')
    if (ret === -2) throw new Error('gunzip error -- short output')
    if (ret === -3) throw new Error('gunzip error -- short input') // should never happen

    const result = getUint8Memory0().slice(outputPtr, outputPtr + size)
    __free(inputPtr)
    __free(outputPtr)

    return result
}

if (import.meta.url.startsWith('file:')) {
    const modulePath = new URL(import.meta.url).pathname;

    if (process.argv[1] === modulePath) {
        // some basic tests

        const data = Buffer.from('Hello, world')
        const dataLong = Buffer.from(Array(1000).fill('a').join(''))

        console.log('testing deflate...')
        let deflatedData = deflateMaxSize(data, 100)
        console.log('  hello world ok:', zlib.inflateSync(deflatedData).toString() === data.toString())

        deflatedData = deflateMaxSize(dataLong, 100)
        console.log('  long ok:', zlib.inflateSync(deflatedData).toString() === dataLong.toString())

        console.log('testing gunzip...')
        const gzippedData = zlib.gzipSync(data)
        console.log('  hello world ok:', Buffer.from(gunzip(gzippedData)).toString() === data.toString())

        const gzippedDataLong = zlib.gzipSync(dataLong)
        console.log('  long ok:', Buffer.from(gunzip(gzippedDataLong)).toString() === dataLong.toString())
    }
}  