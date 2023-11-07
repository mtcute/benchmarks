/* eslint-disable */
import { wasm } from './_init.mjs'

const {
    memory,
    __malloc,
    __free,
    __get_shared_out,
    rhash_sha256,
} = wasm.instance.exports

const sharedOutPtr = __get_shared_out()
let cachedUint8Memory0 = null;

function getUint8Memory0() {
    if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
        cachedUint8Memory0 = new Uint8Array(memory.buffer);
    }
    return cachedUint8Memory0;
}

export function sha256(bytes) {
    const inputPtr = __malloc(bytes.length)
    getUint8Memory0().set(bytes, inputPtr)

    rhash_sha256(inputPtr, bytes.length)
    const result = getUint8Memory0().slice(sharedOutPtr, sharedOutPtr + 32)

    __free(inputPtr)
    return result
}

if (import.meta.url.startsWith('file:')) {
    const modulePath = new URL(import.meta.url).pathname;

    if (process.argv[1] === modulePath) {
        console.log('correct: 4ae7c3b6ac0beff671efa8cf57386151c06e58ca53a78d83f36107316cec125f')
        console.log('result1:', Buffer.from(sha256(Buffer.from('Hello, world'))).toString('hex'))
        console.log('result2:', Buffer.from(sha256(Buffer.from('Hello, world'))).toString('hex'))
    }
}  