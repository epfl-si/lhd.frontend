import { OIDCContext } from '@epfl-si/react-appauth';
import { RoomAuth } from './RoomAuth';
import { env } from '../utils/env';

export function RoomTable({ gQuery }) {
	return (
		<OIDCContext
			authServerUrl={env().REACT_APP_AUTH_SERVER_URL}
			client={{
				clientId: 'LHDv3',
				redirectUri: env().REACT_APP_HOMEPAGE_URL,
				scope: env().REACT_APP_OPENID_SCOPE,
			}}
		>
			<RoomAuth gQuery={gQuery} />
		</OIDCContext>
	);
}
