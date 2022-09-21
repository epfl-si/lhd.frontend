import Keycloak from 'keycloak-js';
const keycloak = new Keycloak({
	url: 'http://localhost:8080',
	realm: 'lhd-frontend',
	clientId: 'lhd-react',
});

export default keycloak;
