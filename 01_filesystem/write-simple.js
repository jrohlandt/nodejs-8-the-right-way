'use strict';

require('fs').writeFile('newfile.txt', 'Hello new file\n', err => {
    if (err) {
        throw err;
    }

    console.log('File saved!');
});