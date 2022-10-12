import { ReactKeycloakProvider } from '@react-keycloak/web';
import keycloak from '../Keycloak';
import { RoomAuth } from './RoomAuth';

export function RoomTable() {
	return (
		<ReactKeycloakProvider authClient={keycloak} onTokens={console.debug}>
			<RoomAuth />
		</ReactKeycloakProvider>
	);
}
