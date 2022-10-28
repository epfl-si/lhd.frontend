import { ReactKeycloakProvider } from '@react-keycloak/web';
import keycloak from '../utils/auth/Keycloak';
import { RoomAuth } from './RoomAuth';

export function RoomTable() {
	return (
		<ReactKeycloakProvider authClient={keycloak}>
			<RoomAuth />
		</ReactKeycloakProvider>
	);
}
