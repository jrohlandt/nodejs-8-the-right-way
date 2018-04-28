'use strict';

const server = require('net').createServer(connection => {

    console.log('Subscriber connected.');

    const firstChunk = '{"type":"changed","timesta';
    const secondChunk = 'mp":14506';
    const thirdChunk = '94370094}\n';

    // Send the firstChunk immediately.
    connection.write(firstChunk);

    // After a short delay, send the secondChunk.
    const timer = setTimeout(() => {
        connection.write(secondChunk);
        // connection.end();
    }, 100);

    const timer2 = setTimeout(() => {
        connection.write(thirdChunk);
        connection.end();
    }, 1000);

    // Clear timer when connection ends.
    connection.on('end', () => {
        clearTimeout(timer);
        clearTimeout(timer2);
        console.log('Subscriber disconnected.');

    });
});

server.listen(60300, () => {
    console.log('Test server is listening for subscribers...');
});
