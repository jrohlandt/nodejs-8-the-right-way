'use strict';

const data = require('fs').readFileSync('target.txt');
process.stdout.write(data.toString());