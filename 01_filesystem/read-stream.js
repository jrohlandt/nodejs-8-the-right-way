'use strict';

require('fs').createReadStream(process.argv[2])
    .on('data', chunk => process.stdout.write(chunk))
    .on('error', err => process.stderr.write(`Error: ${err.message}\n`));
    // .on('error', err => console.log(err)); 
    // todo find if I can use err.errno to write custom error message (like if err.errno === -2 then 'File cannot be found are you sure the file name is correct?').