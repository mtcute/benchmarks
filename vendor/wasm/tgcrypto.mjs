/* eslint-disable */
import { wasm } from './_init.mjs'

const {
    memory,
    __malloc,
    __free,
    __get_shared_key_buffer,
    __get_shared_iv_buffer,
    ige256_encrypt,
    ige256_decrypt,
    ctr256_alloc,
    ctr256_free,
    ctr256: ctr256_,
} = wasm.instance.exports

const sharedKeyBuffer = __get_shared_key_buffer()
const sharedIvBuffer = __get_shared_iv_buffer()
let cachedUint8Memory0 = null;

function getUint8Memory0() {
    if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
        cachedUint8Memory0 = new Uint8Array(memory.buffer);
    }
    return cachedUint8Memory0;
}

export function ige256Encrypt(data, key, iv) {
    const ptr = __malloc(data.length + data.length)

    const inputPtr = ptr
    const outputPtr = inputPtr + data.length

    const mem = getUint8Memory0()
    mem.set(data, inputPtr)
    mem.set(key, sharedKeyBuffer)
    mem.set(iv, sharedIvBuffer)

    ige256_encrypt(inputPtr, data.length, outputPtr)

    const result = getUint8Memory0().slice(outputPtr, outputPtr + data.length)
    __free(ptr)

    return result
}

/**
 * Pefrorm AES-IGE-256 decryption
 *
 * @param data  data to decrypt (must be a multiple of 16 bytes)
 * @param key  encryption key (32 bytes)
 * @param iv  initialization vector (32 bytes)
 */
export function ige256Decrypt(data, key, iv) {
    const ptr = __malloc(data.length + data.length)

    const inputPtr = ptr
    const outputPtr = inputPtr + data.length

    const mem = getUint8Memory0()
    mem.set(data, inputPtr)
    mem.set(key, sharedKeyBuffer)
    mem.set(iv, sharedIvBuffer)

    ige256_decrypt(inputPtr, data.length, outputPtr)

    const result = getUint8Memory0().slice(outputPtr, outputPtr + data.length)
    __free(ptr)

    return result
}

export function createCtr256(key, iv) {
    getUint8Memory0().set(key, sharedKeyBuffer)
    getUint8Memory0().set(iv, sharedIvBuffer)

    return ctr256_alloc()
}

export function freeCtr256(ctx) {
    ctr256_free(ctx)
}

export function ctr256(ctx, data) {
    const inputPtr = __malloc(data.length)
    const outputPtr = __malloc(data.length)

    const mem = getUint8Memory0()
    mem.set(data, inputPtr)

    ctr256_(ctx, inputPtr, data.length, outputPtr)

    const result = mem.slice(outputPtr, outputPtr + data.length)
    __free(outputPtr)

    return result
}

if (import.meta.url.startsWith('file:')) {
    const modulePath = new URL(import.meta.url).pathname;

    if (process.argv[1] === modulePath) {
        // some basic tests

        {
            const key = Buffer.from('5468697320697320616E20696D706C655468697320697320616E20696D706C65', 'hex')
            const iv = Buffer.from('6D656E746174696F6E206F6620494745206D6F646520666F72204F70656E5353', 'hex')
    
            const data = Buffer.from('99706487a1cde613bc6de0b6f24b1c7aa448c8b9c3403e3467a8cad89340f53b', 'hex')
            const dataEnc = Buffer.from('792ea8ae577b1a66cb3bd92679b8030ca54ee631976bd3a04547fdcb4639fa69', 'hex')

            console.log('ige')
            console.log(
                ' encrypt ok:',
                Buffer.from(ige256Encrypt(data, key, iv)).toString('hex') === dataEnc.toString('hex')
            )

            console.log(
                ' decrypt ok:',
                Buffer.from(ige256Decrypt(dataEnc, key, iv)).toString('hex') === data.toString('hex')
            )
        }

        {
            const key = Buffer.from('603DEB1015CA71BE2B73AEF0857D77811F352C073B6108D72D9810A30914DFF4', 'hex')
            const iv = Buffer.from('F0F1F2F3F4F5F6F7F8F9FAFBFCFDFEFF', 'hex')
        
            const data = Buffer.from('6BC1BEE22E409F96E93D7E117393172A', 'hex')
            const dataEnc1 = Buffer.from('601ec313775789a5b7a7f504bbf3d228', 'hex')
            const dataEnc2 = Buffer.from('31afd77f7d218690bd0ef82dfcf66cbe', 'hex')
            const dataEnc3 = Buffer.from('7000927e2f2192cbe4b6a8b2441ddd48', 'hex')

            console.log('ctr')

            {
                const ctr = createCtr256(key, iv)
                const res1 = ctr256(ctr, data)
                const res2 = ctr256(ctr, data)
                const res3 = ctr256(ctr, data)
    
                freeCtr256(ctr)
                
                console.log(
                    ' encrypt ok:',
                    Buffer.from(res1).toString('hex') === dataEnc1.toString('hex') &&
                    Buffer.from(res2).toString('hex') === dataEnc2.toString('hex') &&
                    Buffer.from(res3).toString('hex') === dataEnc3.toString('hex')
                )
            }

            {
                const ctr = createCtr256(key, iv)
                const res1 = ctr256(ctr, dataEnc1)
                const res2 = ctr256(ctr, dataEnc2)
                const res3 = ctr256(ctr, dataEnc3)
    
                freeCtr256(ctr)
                
                console.log(
                    ' decrypt ok:',
                    Buffer.from(res1).toString('hex') === data.toString('hex') &&
                    Buffer.from(res2).toString('hex') === data.toString('hex') &&
                    Buffer.from(res3).toString('hex') === data.toString('hex')
                )
            }
        }

    }
}  