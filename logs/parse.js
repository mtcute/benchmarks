const fs = require('fs')

function parseLogfile(path) {
    const data = fs.readFileSync(path, 'utf8')
    
    const events = {}
    
    for (let line of data.split('\n')) {
        line = line.trim()
        if (!line) continue

        const match = line.match(/^(?<type>[^,]+), (?:size=(?<size>\d+)|packed_size=(?<packed_size>\d+),? unpacked_size=(?<unpacked_size>\d+))/)
        if (!match) {
            console.error(`Failed to parse line: ${line}`)
            continue
        }

        const { type, size, packed_size, unpacked_size } = match.groups

        if (type === 'inflate') {
            if (!events.inflate) {
                events.inflate = [] 
                events.inflateRatio = []
            }

            events.inflate.push(Number(packed_size))
            events.inflateRatio.push(Number(packed_size) / Number(unpacked_size))
        } else {
            if (!events[type]) events[type] = []
            events[type].push(Number(size))
        }
    }

    return events
}

module.exports = { parseLogfile }