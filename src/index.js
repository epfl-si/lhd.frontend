import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.tsx';
import reportWebVitals from './utils/web/reportWebVitals';
import './utils/lang/Dictionary';
import { OIDCContext } from '@epfl-si/react-appauth';
import { LocalStorageBackend } from "@openid/appauth";
import { env } from './utils/env';

import "epfl-elements/dist/css/elements.css";

const environmentVariables = env();

if (! window.IS_PRODUCTION) {
	new EventSource('/esbuild').addEventListener('change', () => window.location.reload())
}

const context = {
	clientId: environmentVariables.REACT_CLIENT_ID
}

if (Object.keys(environmentVariables).indexOf("REACT_CLIENT_SECRET") > -1) {
	console.log("in test/prod environment")
	context.clientSecret = environmentVariables.REACT_CLIENT_SECRET
} else {
	console.log("in dev environment")
	context.scope = environmentVariables.REACT_APP_OPENID_SCOPE
}

ReactDOM.render(
	<OIDCContext
		authServerUrl={environmentVariables.REACT_APP_AUTH_SERVER_URL}
		client={context}
		storage={new LocalStorageBackend()}
	>
		<App />
	</OIDCContext>,

	document.getElementById('root')
);

reportWebVitals();
