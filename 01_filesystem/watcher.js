'use strict';
const fs = require('fs');
const filename = 'target.txt';

fs.stat(filename, (err, stats) => {
    if (err) {
        // console.log(err);
        const msg = err.code === 'ENOENT' ? `The file ${filename} does not exist` : err.message;
        process.stderr.write(`Error: ${msg}\n`);
        return;
    }

    fs.watch(filename, (eventType, fileName) => {
        process.stdout.write(`File was ${eventType}d!\n`);
    });

    process.stdout.write('Now watching target.txt for changes...\n');
});
