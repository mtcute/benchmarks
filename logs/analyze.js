const { parseLogfile } = require('./parse');

const path = require('path')
const fs = require('fs')

const basepath = path.join(__dirname, 'data')

function average(arr) {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function median(arr) {
    const sorted = arr.slice().sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid] + sorted[mid - 1]) / 2 : sorted[mid];
}

function stddev(arr) {
    const avg = average(arr);
    const squareDiffs = arr.map((value) => {
        const diff = value - avg;
        return diff * diff;
    });
    return Math.sqrt(average(squareDiffs));
}

function nthPercentile(arr, n) {
    const sorted = arr.slice().sort((a, b) => a - b);
    const index = Math.floor(sorted.length * n / 100);
    const indexBack = sorted.length - index - 1;
    return `${sorted[indexBack]} ⩽ x ⩽ ${sorted[index]}`;
}

function min(arr) {
    let min = Infinity;
    for (const value of arr) {
        if (value < min) {
            min = value;
        }
    }
    return min;
}

function max(arr) {
    let max = -Infinity;
    for (const value of arr) {
        if (value > max) {
            max = value;
        }
    }
    return max;
}

function analyze(file) {
    const parsed = typeof file === 'string' ? parseLogfile(file) : file

    for (const [kind, data] of Object.entries(parsed)) {
        console.log('  %s', kind)
        
        console.log('    samples: %s', data.length)
        console.log('    min: %s', min(data))
        console.log('    max: %s', max(data))
        console.log('    average: %s', average(data))
        console.log('    median: %s', median(data))
        console.log('    stddev: %s', stddev(data))
        console.log('    99th percentile: %s', nthPercentile(data, 99))
        console.log('    90th percentile: %s', nthPercentile(data, 95))
        console.log('    75th percentile: %s', nthPercentile(data, 90))
    }
}

module.exports = { analyze }

if (require.main === module) {
    if (process.argv[2]) {
        analyze(process.argv[2])
    }

    for (const file of fs.readdirSync(basepath)) {
        if (!file.endsWith('.log')) {
            continue
        }

        console.log(file)
        analyze(path.join(basepath, file))
    }
}