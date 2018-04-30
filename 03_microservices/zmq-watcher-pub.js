'use strict';

const fs = require('fs');
const zmq = require('zeromq');
const filename = process.argv[2];

// Create the publisher endpoint
const publisher = zmq.socket('pub');

fs.watch(filename, () => {

    publisher.send(JSON.stringify({
        type: 'changed',
        file: filename,
        timestamp: Date.now()
    }));
});

// Listen on TCP port 60400
publisher.bind('tcp://*:60400', err => {
    if (err) {
        throw err;
    }

    console.log('Publisher is listening for zmq subscribers...');
});