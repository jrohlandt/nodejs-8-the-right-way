'use strict';

const program = require('commander');
const fs = require('fs');
const request = require('request');
const pkg = require('./package.json');

const fullUrl = (path = '') => {
    let url = `http://${program.host}:${program.port}/`;
    if (program.index) {
        url += program.index + '/';
        if (program.type) {
            url += program.type + '/';
        }
    }
    return url + path.replace(/^\/*/, '');
};

const handleResponse = (err, res, body) => {
    if (program.json) {
        // console.log(JSON.stringify(err || body));
        console.log(JSON.stringify(err || body, null, ' '));
        
    } else {
        if (err) throw err;
        console.log(body);
    }
};

program
    .version(pkg.version)
    .description(pkg.description)
    .usage('[options] <command> [...]')
    .option('-o, --host <hostname>', 'hostname [localhost]', 'localhost')
    .option('-p, --port <number>', 'port number [9200]', '9200')
    .option('-j, --json', 'format output as JSON')
    .option('-i, --index <name>', 'which index to use')
    .option('-t, --type <type>', 'default type for bulk operations');

program
    .command('url [path]')
    .description('generate the URL for the options and path (default is /)')
    .action((path = '/') => console.log(fullUrl(path)));

program
    .command('get [path]')
    .description('perform an HTTP GET request for path (default is /)')
    .action((path = '/') => {
        const options = {
            url: fullUrl(path),
            json: program.json
        };

        request(options, handleResponse);
    });

program
    .command('create-index')
    .description('create an index')
    .action(() => {
        if (!program.index) {
            const msg = 'No index specified! Use --index <name>';
            if (!program.json) throw Error(msg);
            console.log(JSON.stringify({error: msg}));
            return;
        }

        request.put(fullUrl(), handleResponse);
    });

program
    .command('list-indices')
    .alias('li')
    .description('Get a list of indices in this cluster.')
    .action(() => {
        const path = program.json ? '_all' : '_cat/indices?v';
        const url = fullUrl(path);
        console.log('');
        console.log(`Sending HTTP Request: ${url}`);
        console.log('');
        request({url: url, json: program.json}, handleResponse);
    });

program
    .command('bulk <file>')
    .description('Read and perform bulk operations from the specified file.')
    .action((file => {
        fs.stat(file, (err, stats) => {
            if (err) {
                if (program.json) {
                    console.log(JSON.stringify(err));
                    return;
                }
                throw err;
            }

            const req = request.post({
                url: fullUrl('_bulk'),
                json: true,
                headers: {
                    'content-length': stats.size,
                    'content-type': 'application/json'
                }
            });

            const stream = fs.createReadStream(file);
            stream.pipe(req);
            req.pipe(process.stdout);
        });
    }));
    
program.parse(process.argv);

if (!program.args.filter(arg => typeof arg === 'object').length) {
    program.help();
}