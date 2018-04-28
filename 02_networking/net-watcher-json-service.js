'use strict';

const fs = require('fs');
const net = require('net');
const port = 60300;
const filename = process.argv[2];

if (!filename) {
    throw Error('Error: No file specified.');
}

net.createServer(connection => {
    // Reporting
    console.log('Subscriber connected.');
    connection.write(JSON.stringify({type: 'watching', file: 'filename'}) + '\n');

    // Watcher setup
    const watcher = fs.watch(filename, () => connection.write(JSON.stringify({type: 'changed', timestamp: Date.now()}) + '\n'));

    // Clean up
    connection.on('close', () => {
        console.log('Subscriber disconnected.');
        watcher.close();
    });
}).listen(port, () => console.log(`Listening for subscribers on port ${port}...\n`));