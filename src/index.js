import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.tsx';
import reportWebVitals from './utils/web/reportWebVitals';
import './utils/lang/Dictionary';
import { OIDCContext } from "@epfl-si/react-appauth";
import { LocalStorageBackend } from "@openid/appauth";
import { env } from './utils/env';

import "epfl-elements/dist/css/elements.css";
import "epfl-elements-react-si-extra/index.css"
import { Auth2Store } from '@epfl-si/appauth/src/OpenIDConnect.js';

const environmentVariables = env();
const store = new LocalStorageBackend(new Auth2Store());

if (! window.IS_PRODUCTION) {
	new EventSource('/esbuild').addEventListener('change', () => window.location.reload())
}

const context = {
	clientId: environmentVariables.OIDC_CLIENT_ID,
	scope: environmentVariables.OIDC_SCOPE
}

if (Object.keys(environmentVariables).indexOf("REACT_CLIENT_SECRET") > -1) {
	context.clientSecret = environmentVariables.REACT_CLIENT_SECRET
}

ReactDOM.render(
	<OIDCContext
		authServerUrl={environmentVariables.REACT_APP_AUTH_SERVER_URL}
		client={context}
		storage={store}
		onLogout={() => window.location.href=environmentVariables.REACT_APP_HOMEPAGE_URL}
	>
		<App />
	</OIDCContext>,

	document.getElementById('root')
);

reportWebVitals();
