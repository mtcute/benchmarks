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

const args = require("minimist")(process.argv.slice(2), {
    string: ["data", "kind", "tests"],
});

const dataOnly = args.data?.split(',')
const kindOnly = args.kind?.split(',') ?? ['deflate', 'ige', 'sha256']
const testsParam = args.tests ? `--tests=${args.tests}` : ''

const all = {}

for (const kind of kindOnly) {
    const res = all[kind] = {}
    
    for (const data of fs.readdirSync('./data')) {
        if (dataOnly && !dataOnly.includes(data)) continue

        process.stderr.write(`Benchmarking ${kind} ${data}\n`)
        const resultsDeflate = cp.execSync(`node ./benchmark.js --kind=${kind} --data=${data} ${testsParam}`, { stdio: 'pipe', encoding: 'utf-8' })
        res[data] = buildResultsMap(resultsDeflate)
    }
}

for (const kind of kindOnly) {
    console.log('### ' + kind)
    console.log(buildTable(all[kind]))
}