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

const environmentVariables = env();
const store = new LocalStorageBackend();

if (! window.IS_PRODUCTION) {
	new EventSource('/esbuild').addEventListener('change', () => window.location.reload())
}

const context = {
	clientId: environmentVariables.OIDC_CLIENT_ID,
	scope: environmentVariables.OIDC_SCOPE,
	redirectUri: window.location
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
