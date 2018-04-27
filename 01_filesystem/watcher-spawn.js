#!/usr/bin/env node
'use strict';
const fs = require('fs');
const spawn = require('child_process').spawn;
// console.log(process.argv);
// usage: ./watcher-spawn.js ls -l -h filename.txt

const command = process.argv[2];
const filename = process.argv[process.argv.length -1];
const params = process.argv.slice(2); // includes filename

// console.log(command, params);

if (!filename) {
    throw Error('Please specify a file to watch!');
}

fs.stat(filename, (err, stats) => {

    if (err) {
        process.stderr.write(`Error: ${err.message}\n`);
        return;
    }

    fs.watch(filename, (eventType, file_name) => {

        process.stdout.write(`File ${file_name} ${eventType}d!\n`);
    
        const ls = spawn(command, params);
        // ls.stdout.pipe(process.stdout);
        
        let output = '';
        ls.stdout.on('data', chunk => output += chunk)
            .on('error', err => process.stdout.write(`Error: ${err.message}`));
    
        ls.on('close', () => {
            output.split(/\s+/).forEach((val, index) => process.stdout.write(val + ' '));
        });
    
    });
    
    
    process.stdout.write(`Now watching ${filename} for changes...\n`);
});
