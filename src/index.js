import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.tsx';
import reportWebVitals from './utils/web/reportWebVitals';
import './utils/lang/Dictionary';
import { OIDCContext } from '@epfl-si/react-appauth';
import { env } from './utils/env';

import "epfl-elements/dist/css/elements.css";

if (! window.IS_PRODUCTION) {
	new EventSource('/esbuild').addEventListener('change', () => window.location.reload())
}

ReactDOM.render(
	<OIDCContext
		authServerUrl={env().REACT_APP_AUTH_SERVER_URL}
		client={{
			clientId: env().REACT_CLIENT_ID,
			scope: env().REACT_APP_OPENID_SCOPE,
		}}
	>
		<App />
	</OIDCContext>,

	document.getElementById('root')
);

reportWebVitals();
