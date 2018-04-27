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
    connection.write(`Now watching "${filename}" for changes...\n`);

    // Watcher setup
    const watcher = fs.watch(filename, () => connection.write(`File "${filename}" changed: ${new Date()} \n`));

    // Clean up
    connection.on('close', () => {
        console.log('Subscriber disconnected.');
        watcher.close();
    });
}).listen(port, () => console.log(`Listening for subscribers on port ${port}...\n`));