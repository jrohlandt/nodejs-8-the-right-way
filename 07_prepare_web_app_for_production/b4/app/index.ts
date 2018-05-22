import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../node_modules/bootstrap-social/bootstrap-social.css';
import '../node_modules/font-awesome/css/font-awesome.min.css';

import 'bootstrap';

import * as templates from './templates.ts';

/**
 * Show an alert to the user.
 */
const showAlert = (message, type = 'danger') => {
  const alertsElement = document.body.querySelector('.b4-alerts');
  const html = templates.alert({type, message});
  alertsElement.insertAdjacentHTML('beforeend', html);
};

/**
 * Use Window location hash to show the specified view.
 */
const showView = async () => {
  const mainElement = document.body.querySelector('.b4-main');
  const [view, ...params] = window.location.hash.split('/');

  switch (view) {
    case '#welcome':
      const session = await fetchJSON('/api/session');
      mainElement.innerHTML = templates.welcome({session});
      if (session.error) {
        showAlert(session.error);
      }
      break;
    default:
      // Unrecognized view.
      throw Error(`Unrecognized view: ${view}`);
  }
};

/**
 * Convenience method to fetch and decode JSON.
 */
const fetchJSON = async (url, method = 'GET') => {
  try {
    const response = await fetch(url, {
      method, 
      credentials: 'same-origin' // Ensures that credential information (cookies) is send with the request.
    });
  } catch(error) {
    return {error};
  }
}

// Page setup.
(async () => {
  const session = await fetchJSON('/api/session');
  document.body.innerHTML = templates.main({session});
  window.addEventListener('hashchange', showView);
  showView().catch(err => window.location.hash = '#welcome');
})();
