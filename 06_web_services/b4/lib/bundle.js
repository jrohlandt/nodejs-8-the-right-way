/**
 * Provides endpoints for working with book bundles.
 */
'use strict';
const rp = require('request-promise');

module.exports = (app, es) => {
    const url = `http://${es.host}:${es.port}/${es.bundles_index}/bundle`;

    /**
     * Create a new bundle with the specified name.
     * curl -X POST http://<host>:<port>/api/bundle?name=<name>
     */
    app.post('/api/bundle', (req, res) => {
        const bundle = {
            name: req.query.name || '',
            books: [],
        };

        rp.post({url, body: bundle, json: true})
            .then(esResBody => res.status(201).json(esResBody))
            .catch(({error}) => res.status(error.status || 502).json(error));
    });

    /**
     * Retrieve a list of all bundles.
     */
    app.get('/api/bundles', async (req, res) => {
        try {
            const bundles = await rp({url: `http://${es.host}:${es.port}/${es.bundles_index}/_search`, json: true});
            res.status(200).json(bundles);
        } catch (err) {
            res.status(err.statusCode || 502).json(err.error);
        }
    });

    /**
     * Retrieve a given bundle.
     */
    app.get('/api/bundle/:id', async (req, res) => {
        const options = {
            url: `${url}/${req.params.id}`,
            json: true,
        };

        try {
            const esResBody = await rp(options);
            res.status(200).json(esResBody);
        } catch(esResErr) {
            res.status(esResErr.statusCode || 502).json(esResErr.error);
        }
    });

    /**
     * Set the specified bundles's name with the specified name.
     * curl -X PUT http://<host>:<port>/api/bundle/<id>/name/<name>
     */
    app.put('/api/bundle/:id/name/:name', async (req, res) => {
        const bundleUrl = `${url}/${req.params.id}`;

        try {
            const bundle = (await rp({url: bundleUrl, json: true}))._source;

            bundle.name = req.params.name;

            const esResBody = await rp.put({url: bundleUrl, body: bundle, json: true});
            res.status(200).json(esResBody);
        } catch (esResErr) {
            res.status(esResErr.statusCode || 502).json(esResErr.error);
        }
    });

    /**
     * Put a book into a bundle by it's id
     * curl -X PUT http://<host>:<port>/api/bundle/<id>/book/<pgid>
     */
    app.put('/api/bundle/:id/book/:pgid', async (req, res) => {
        const bundleUrl = `${url}/${req.params.id}`;
        const bookUrl = `http://${es.host}:${es.port}/${es.books_index}/book/${req.params.pgid}`;
        console.log(bundleUrl, bookUrl);

        try {
            const [bundleRes, bookRes] = await Promise.all([
                rp({url: bundleUrl, json: true}),
                rp({url: bookUrl, json: true}),
            ]);
            
            const {_source: bundle, _version: version} = bundleRes;
            const {_source: book} = bookRes;

            // check if book already exists in bundle
            if (bundle.books.findIndex(book => book.id === req.params.pgid) === -1) {
                bundle.books.push({
                    id: req.params.pgid,
                    title: book.title,
                });
            }

            // Put the bundle back in the index
            const esResBody = await rp.put({
                url: bundleUrl,
                qs: { version },
                body: bundle,
                json: true,
            });

            res.status(200).json(esResBody);
            
        } catch (esResErr) {
            res.status(esResErr.statusCode || 502).json(esResErr.error);
        }
    });

    /** 
     * Delete Bundle: find a bundle using the given bundle id and then delete it.
     */
    app.delete('/api/bundle/:id', async (req, res) => {

        try {
            const esResBody = await rp.delete({url: `${url}/${req.params.id}`, json: true});
            res.status(200).json(esResBody);
        } catch (err) {
            res.status(err.statusCode || 502).json(err.error);
        }
    });

    /**
     * Delete given book from given bundle.
     */
    app.delete('/api/bundle/:id/book/:pgid', async (req, res) => {
        try {
            const {_source: bundle, _version: version} = await rp({url: `${url}/${req.params.id}`, json: true });
            const bookIndex = bundle.books.findIndex(book => book.id === req.params.pgid);
            if (bookIndex === -1) {
                throw {statusCode: 409, error: 'book not found in bundle'};            
            }
            bundle.books.splice(bookIndex, 1);

            const esResBody = await rp.put({
                url: `${url}/${req.params.id}`,
                qs: { version },
                body: bundle,
                json: true,
            });

            res.status(200).json(bundle);
        } catch (err) {
            res.status(err.statusCode || 502).json(err.error);
        }
    });
}

