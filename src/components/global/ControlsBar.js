import { Box, Button } from '@material-ui/core';
import { useKeycloak } from '@react-keycloak/web';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../Table/LanguageSwitcher';

export default function ControlsBar() {
	const { keycloak } = useKeycloak();
	const isLoggedIn = keycloak.authenticated;

	const { t } = useTranslation();
	return (
		<Box
			display="flex"
			flexDirection="row"
			alignItems="center"
			justifyContent="flex-end"
			gridGap={8}
			width="100%"
		>
			<LanguageSwitcher />
			{isLoggedIn && (
				<Button variant="outlined" onClick={() => keycloak.logout()}>
					{t('logout')}
				</Button>
			)}
		</Box>
	);
}
