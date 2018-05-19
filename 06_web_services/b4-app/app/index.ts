import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import * as templates from './templates.ts';

document.body.innerHTML = templates.main();

const mainElement = document.body.querySelector('.b4-main');
const alertsElement = document.body.querySelector('.b4-alerts');

// alertsElement.innerHTML = templates.alert({ type: 'info', message: 'Handlebars is working!'});

/** 
 * Use Window location hash to show the specified view.
 */
const showView = async () => {
    const [view, ...params] = window.location.hash.split('/');

    switch(view) {
        case '#welcome':
            mainElement.innerHTML = templates.welcome();
            break;
        case '#list-bundles':
            const bundles = await getBundles();
            listBundles(bundles);
            break;
        default:
            // Unrecognized view.
            throw Error(`Unrecognized view: ${view}`);
    }
};
window.addEventListener('hashchange', showView);

// On page load/reload call showView and set hash if it has none or if hash is invalid.
showView().catch(err => window.location.hash = '#welcome');

const listBundles = bundles => {
    mainElement.innerHTML = templates.listBundles({bundles});    
};

const getBundles = async () => {
    const esRes = await fetch('/es/b4/bundle/_search?size=1000');
    const esResBody = await esRes.json();
    return esResBody.hits.hits.map(hit => ({
        id: hit._id,
        name: hit._source.name,
    }));
};

