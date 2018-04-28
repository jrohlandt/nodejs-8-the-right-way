'use strict';

const assert = require('assert');
const EventEmitter = require('events').EventEmitter;
const LDJClient = require('../lib/ldj-client.js');

describe('LDJClient', () => {
    let stream = null;
    let client = null;

    beforeEach(() => {
        stream = new EventEmitter();
        client = new LDJClient(stream);
    });

    it('should emit a message event from a single data event', done => {
        client.on('message', message => {
            assert.deepEqual(message, {foo: 'bar'});
            done();
        });
        stream.emit('data', '{"foo":"bar"}\n');
    });

    it('should emit a message event from split data events', done => {
        client.on('message', message => {
            assert.deepEqual(message, {foo: 'bar'});
            done();
        });
        stream.emit('data', '{"foo":');
        process.nextTick(() => stream.emit('data', '"bar"}\n'));
    });

    it('should emit an "invalid" eventtype if json in not valid', done => {
        client.on('message', message => {
            assert.deepEqual(message, {type: 'invalid json'});
            done();
        });
        stream.emit('data', '{"type": "changed\n');
    });

});

// describe('LDJClientNull', () => {

//     it('should throw an error when null is passed to LDJClient constructor', done => {

//         assert.throws(
//             () => {
//                 let client = new LDJClient(null);
//             }, 
//             Error
//         );
//     });
// });