const fs = require('fs')
const path = require('path')
const functions = require('./functions')

const data = path.join(__dirname, 'data')

for (const file of fs.readdirSync(data)) {
    if (!file.endsWith('.json')) {
        continue
    }

    const fileData = fs.readFileSync(path.join(data, file), 'utf-8')

    let min = Infinity
    let max = 0
    let total = 0
    
    for (let i = 0; i < 1000; i++) {
        const size = functions.randomize(fileData).length
        if (size < min) min = size
        if (size > max) max = size
        total += size
    }

    console.log(file)
    console.log('  samples: %s', 1000)
    console.log('  min: %s', min)
    console.log('  max: %s', max)
    console.log('  average: %s', total / 1000)
}