const cp = require('child_process');
const fs = require('fs');

function buildResultsMap(results) {
    const lines = results.split('\n');

    const map = {}

    let current = null

    for (const line of lines) {
        if (line.match(/^\d+\./)) {
            map[line] = []
            current = line
            continue
        }
        
        if (line.trim() === '') {
            current = null
            continue
        }

        if (current) map[current].push(line)
    }

    return Object.fromEntries(Object.entries(map).map(([k, v]) => [k, v.join('\n')]))
}

function buildTable(map) {
    const datas = Object.keys(map)
    let res = '| | ' + datas.join(' | ') + ' |\n| --- '

    let libraries = new Set()

    for (const data of datas) {
        res += '| --- '
        for (const lib of Object.keys(map[data])) {
            libraries.add(lib)
        }
    }

    res += '|\n'

    libraries = Array.from(libraries).sort((a, b) => a.split(".")[0] - b.split(".")[0])

    for (const lib of libraries) {
        res += `| ${lib} | `

        for (const data of datas) {
            const results = map[data]

            if (results[lib]) {
                res += `<pre>${results[lib].replace(/\n/g, '<br/>')}</pre> | `
            } else {
                res += ' | '
            }
        }

        res += '\n'
    }


    return res
}

const allDeflate = {}
const allCrypto = {}
for (const data of fs.readdirSync('./data')) {

    process.stderr.write(`Benchmarking deflate ${data}\n`)
    const resultsDeflate = cp.execSync(`node ./benchmark.js --kind=deflate --data=${data} ${process.argv.slice(2)}`, { stdio: 'pipe', encoding: 'utf-8' })
    allDeflate[data] = buildResultsMap(resultsDeflate)

    process.stderr.write(`Benchmarking crypto ${data}\n`)
    const resultsCrypto = cp.execSync(`node ./benchmark.js --kind=crypto --data=${data} ${process.argv.slice(2)}`, { stdio: 'pipe', encoding: 'utf-8' })
    allCrypto[data] = buildResultsMap(resultsCrypto)
}

console.log('### Deflate')
console.log(buildTable(allDeflate))
console.log('### AES IGE')
console.log(buildTable(allCrypto))