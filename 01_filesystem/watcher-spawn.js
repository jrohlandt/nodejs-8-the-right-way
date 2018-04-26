'use strict';
const fs = require('fs');
const spawn = require('child_process').spawn;
// console.log(process.argv);
const filename = process.argv[2];

if (!filename) {
    throw Error('Please specify a file to watch!');
}

fs.watch(filename, () => {
    console.log(`File ${filename} changed!`);
    const ls = spawn('ls', ['-l', '-h', filename]);
    // ls.stdout.pipe(process.stdout);
    
    let output = '';
    ls.stdout.on('data', chunk => output += chunk)
        .on('error', err => console.log('errrr: ', err));

    ls.on('close', () => {
        const parts = output.split(/\s+/);
        console.log(parts[0], parts[4], parts[8]);
    })

});

console.log(`Now watching ${filename} for changes...`);