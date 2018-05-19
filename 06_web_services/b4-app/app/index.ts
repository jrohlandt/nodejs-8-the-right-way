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

const showAlert = (message, type = 'danger') => {
    const html = templates.alert({type, message});
    alertsElement.insertAdjacentHTML('beforeend', html);
};

const listBundles = bundles => {
    mainElement.innerHTML = templates.addBundleForm() + templates.listBundles({bundles});

    const form = mainElement.querySelector('form');
    form.addEventListener('submit', event => {
        event.preventDefault();
        const name = form.querySelector('input').value;
        addBundle(name);
    });

    const deleteButtons = mainElement.querySelectorAll('button.delete');
    for (let i = 0; i < deleteButtons.length; i++) {
        const deleteButton = deleteButtons[i];
        deleteButton.addEventListener('click', event => {
            deleteBundle(deleteButton.getAttribute('data-bundle-id'));
        });
    }
};

const getBundles = async () => {
    const esRes = await fetch('/es/b4/bundle/_search?size=1000');
    const esResBody = await esRes.json();
    return esResBody.hits.hits.map(hit => ({
        id: hit._id,
        name: hit._source.name,
    }));
};

/**
 * Create a new bundle with the given name, then list bundles.
 */
const addBundle = async (name) => {
    try {
        // Grab the existing bundles.
        const bundles = await getBundles();

        // Add the new bundle.
        const url = `/api/bundle?name=${encodeURIComponent(name)}`;
        const res = await fetch(url, {method: 'POST'});
        const resBody = await res.json();

        // Merge the new bundle into the original results and show them.
        bundles.push({id: resBody._id, name });
        listBundles(bundles);

        showAlert(`Bundle "${name}" created!`, 'success');
    } catch (err) {
        showAlert(err);
    }
};


/**
 * Delete the bundle with the specified ID, then list bundles.
 */
const deleteBundle = async (bundleId) => {
    try {
        let bundles = await getBundles();
        const bundleIndex = bundles.findIndex(bundle => bundle.id === bundleId);
        if (bundleIndex === -1) {
            throw Error(`Bundle with id "${bundleId} could not be found."`);
        }
        await fetch(`/api/bundle/${bundleId}`, {method: 'DELETE'});
        bundles.splice(bundleIndex, 1);
        listBundles(bundles);
        showAlert(`Bundle deleted!`, 'success');
    } catch (err) {
        showAlert(err);
    }
}
