'use strict';

const cheerio = require('cheerio');

module.exports = rdf => {

    const $ = cheerio.load(rdf);

    const book = {};

    book.id = +$('pgterms\\:ebook').attr('rdf:about').replace('ebooks/', '');
    
    return book;
};