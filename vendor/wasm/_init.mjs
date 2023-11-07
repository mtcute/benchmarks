import * as fs from 'fs'
import * as path from 'path'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

const wasmPath = process.env.WASM_NO_UNROLL ? 'lib/mtcute-no-unroll.wasm' : 'lib/mtcute.wasm'
const wasmBuffer = fs.readFileSync(path.join(__dirname, wasmPath))

const wasm = await WebAssembly.instantiate(wasmBuffer)

export { wasm }