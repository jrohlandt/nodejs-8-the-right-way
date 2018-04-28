// LDJ: line-delimited JSON
'use strict';

const EventEmitter = require('events').EventEmitter;

class LDJClient extends EventEmitter {
    constructor(stream) {
        super();
        let buffer = '';
        stream.on('data', data => {
            buffer += data;

            // try {
            //     let b = JSON.parse(buffer);
            //     // if valid json, then message is complete but
            //     // it has no trailing newline \n,
            //     // so just append it
            //     buffer += '\n';
            // } catch (e) {
            //     // no action needed
            // }

            let boundary = buffer.indexOf('\n');
            while (boundary !== -1) {
                // take json, not newline characters
                let input = buffer.substring(0, boundary);

                // reset buffer
                buffer = buffer.substring(boundary + 1); // why not just set buffer = '' ?
                
                try {
                    input = JSON.parse(input);
                } catch (e) {
                    // console.log(e.message);
                    input = {type: 'invalid json'};
                }
                this.emit('message', input);
                boundary = buffer.indexOf('\n'); // why not just set boundary to -1 ?
            }
        });
    }

    static connect(stream) {
        return new LDJClient(stream);
    }
}

module.exports = LDJClient;