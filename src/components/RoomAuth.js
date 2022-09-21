import { Button } from '@epfl/epfl-sti-react-library';
import {
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
} from '@material-ui/core';
import { Alert } from '@mui/material';
import { useKeycloak } from '@react-keycloak/web';
import { AppTable } from '../components/appTable';

export function RoomAuth() {
	const { keycloak } = useKeycloak();
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
						<b>Warning - You are not logged in !</b>
					</Alert>
					<DialogTitle>Log in to access LHD</DialogTitle>
					<DialogContent>
						You are trying to access sensitive data, please provide credentials to
						confirm your identity.
					</DialogContent>
					<DialogActions>
						<Button label="Login" onClickFn={() => keycloak.login()} />
					</DialogActions>
				</Dialog>
			)}
		</>
	);
}
