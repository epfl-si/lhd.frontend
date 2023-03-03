import { OIDCContext } from '@epfl-si/react-appauth';
import { RoomAuth } from './RoomAuth';

export function RoomTable() {
	return (
		<OIDCContext
			authServerUrl={ process.env.REACT_APP_AUTH_SERVER_URL }
			client={{ clientId: 'LHDv3', redirectUri: process.env.REACT_APP_HOMEPAGE_URL }}
		>
			<RoomAuth />
		</OIDCContext>
	);
}
