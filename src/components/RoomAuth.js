import { Button } from '@epfl/epfl-sti-react-library';
import {
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
} from '@material-ui/core';
import { Alert } from '@mui/material';
import { useKeycloak } from '@react-keycloak/web';
import { useTranslation } from 'react-i18next';
import { AppTable } from '../components/appTable';

export function RoomAuth() {
	const { keycloak } = useKeycloak();
	const { t } = useTranslation();
	const isLoggedIn = keycloak.authenticated;
	return (
		<>
			{isLoggedIn ? (
				<AppTable
					graphqlBody={`rooms (where: { building: { equals: "BC"} }) {
    name
    occupancies { 
      cosecs { name }
      professors { name }
      unit {
        name
        institute {
          name
          school {
            name
          }
        }
        unitId
      }
    }
    building
    sector
    floor
    kind {
      name
    }
  }`}
					variables={{}}
				/>
			) : (
				<Dialog open={true}>
					<Alert severity="warning">
						<b>{t('login.warning')}</b>
					</Alert>
					<DialogTitle>{t('login.title')}</DialogTitle>
					<DialogContent>{t('login.content')}</DialogContent>
					<DialogActions>
						<Button label={t('login.button')} onClickFn={() => keycloak.login()} />
					</DialogActions>
				</Dialog>
			)}
		</>
	);
}
