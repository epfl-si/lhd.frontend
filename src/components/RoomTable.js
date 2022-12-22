import { OIDCContext } from '@epfl-si/react-appauth';
import { RoomAuth } from './RoomAuth';

export function RoomTable() {
	return (
		<OIDCContext
			authServerUrl={'http://localhost:8080/realms/LHD'}
			client={{ clientId: 'React', redirectUri: 'http://localhost:3000/' }}
		>
			<RoomAuth />
		</OIDCContext>
	);
}
