import {
	LoginButton,
	StateEnum,
	useOpenIDConnectContext,
} from '@epfl-si/react-appauth';
import {
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
} from '@material-ui/core';
import { Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AppTable } from './Table/AppTable';
import LanguageSwitcher from './Table/LanguageSwitcher';

export function RoomAuth() {
	const { t } = useTranslation();
	const oidc = useOpenIDConnectContext();
	const isLoggedIn = oidc.state === StateEnum.LoggedIn;
	console.log(isLoggedIn);
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
					<LanguageSwitcher />
					<DialogTitle>{t('login.title')}</DialogTitle>
					<DialogContent>{t('login.content')}</DialogContent>
					<DialogActions>
						<LoginButton />
					</DialogActions>
				</Dialog>
			)}
		</>
	);
}
