/* eslint-disable */
import { wasm } from './_init.mjs'

const {
    memory,
    __malloc,
    __free,
    __get_shared_out,
    clibs_SHA1,
} = wasm.instance.exports

const sharedOutPtr = __get_shared_out()
let cachedUint8Memory0 = null;

function getUint8Memory0() {
    if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
        cachedUint8Memory0 = new Uint8Array(memory.buffer);
    }
    return cachedUint8Memory0;
}

export function sha1(bytes) {
    const inputPtr = __malloc(bytes.length)
    getUint8Memory0().set(bytes, inputPtr)

    clibs_SHA1(inputPtr, bytes.length)
    const result = getUint8Memory0().slice(sharedOutPtr, sharedOutPtr + 20)

    __free(inputPtr)
    return result
}

if (import.meta.url.startsWith('file:')) {
    const modulePath = new URL(import.meta.url).pathname;

    if (process.argv[1] === modulePath) {
        console.log('correct: e02aa1b106d5c7c6a98def2b13005d5b84fd8dc8')
        console.log('result1:', Buffer.from(sha1(Buffer.from('Hello, world'))).toString('hex'))
        console.log('result2:', Buffer.from(sha1(Buffer.from('Hello, world'))).toString('hex'))
    }
}  