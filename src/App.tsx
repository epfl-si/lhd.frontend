import {useEffect, useState} from 'react';
import {BrowserRouter, Link, Route, Switch} from 'react-router-dom';
import {LoginButton, StateEnum, useOpenIDConnectContext} from "@epfl-si/react-appauth";
import {Box, Dialog, DialogActions, DialogContent, DialogTitle,} from '@material-ui/core';
import {Alert} from '@mui/material';
import {useTranslation} from 'react-i18next';
import RoomDetails from './pages/roomdetails';
import {UnitControl} from "./pages/units";
import UnitDetails from "./pages/unitdetails";
import {HazardFormControl} from "./pages/hazardFormControl";
import HazardFormDetails from "./pages/hazardformdetails";
import {RoomControl} from "./pages/rooms";
import {fetchConnectedUser} from "./utils/graphql/FetchingTools";
import {env} from "./utils/env";
import HazardFormChildDetails from "./pages/hazardformchilddetails";
import "../css/styles.scss";
import {OrganismsControl} from "./pages/organisms";
import {HazardsControl} from "./pages/hazards";
import {ChemicalsControl} from "./pages/chemicals";
import {ChemicalsAuthorizationControl} from "./pages/chemicalAuthorizations";
import {RadioprotectionsAuthorizationControl} from "./pages/radioprotectionAuthorizations";
import {Base} from "./components/global/Base";
import {notificationType} from "./utils/ressources/types";
import Notifications from "./components/Table/Notifications";
import packageJson from '../package.json';

function App() {
	const { t } = useTranslation();
	const oidc = useOpenIDConnectContext();
	let loggedIn = false;
	const [selectedMenu, setSelectedMenu] = useState<string>('rooms');
	const [notificationType, setNotificationType] = useState<notificationType>({
		type: "info",
		text: '',
	});
	const [openNotification, setOpenNotification] = useState<boolean>(false);
	const [connectedUser, setConnectedUser] = useState<object>({
		groups: [],
		userName: '',
		canEditHazards: false,
		canEditRooms: false,
		canListUnits: false,
		canListHazards: false,
		canListRooms: false,
		isAdmin: false,
		canEditUnits: false,
		canListReportFiles: false,
		canListOrganisms: false,
		canEditOrganisms: false,
		canListChemicals: false,
		canEditChemicals: false,
		canListAuthorizations: false,
		canEditAuthorizations: false,
		canListPersons: false,
		canListForms: false
	});

	useEffect(() => {
		if (!loggedIn && oidc.state == StateEnum.LoggedIn) {
			loadFetch();
			loggedIn = true;
		}
	}, [oidc.accessToken, oidc.state, selectedMenu]);

	const loadFetch = async () => {
		const results = await fetchConnectedUser(
			env().REACT_APP_GRAPHQL_ENDPOINT_URL,
			oidc.accessToken
		);
		if (results.status === 200 && results.data) {
			console.log('ConnectedUser', results.data);
			setConnectedUser(results.data);
		} else if (results.status === 200) {
			setNotificationType({
				text: t('generic.userError'),
				type: 'error'
			});
			setOpenNotification(true);
		} else if (results.status === 403) {
			oidc.logout();
		}
	};

	const handleClose = () => {
		setOpenNotification(false);
	};

	const handleCurrentPage = (page: string) => {
		setSelectedMenu(page);
	}

	const [openAudit, setOpenAudit] = useState(false);
	const [openUpdates, setOpenUpdates] = useState(false);
	const [openLinks, setOpenLinks] = useState(false);

	if (oidc.state == StateEnum.InProgress) {
		return <div></div>
	}
	if (oidc.state != StateEnum.LoggedIn) {
		return (
			<Dialog open={true}>
				<Alert severity="warning">
					<b>{t('login.warning')}</b>
				</Alert>
				{/*<LanguageSwitcher />*/}
				<DialogTitle>{t('login.title')}</DialogTitle>
				<DialogContent>{t('login.content')}</DialogContent>
				<DialogActions>
					<LoginButton />
				</DialogActions>
			</Dialog>
		);
	}
	return (
		<><BrowserRouter>
			<Base>
				<Base.AsideMenu>
					<ul>
						{(connectedUser.canListRooms) &&
						<li style={{backgroundColor: `${selectedMenu === 'rooms' ? '#FFCECE' : ''}`}}>
							<Link to="/roomcontrol">{t(`menu.rooms`)}</Link>
						</li>
						}
						{(connectedUser.canListHazards) &&
						<li style={{backgroundColor: `${selectedMenu === 'hazards' ? '#FFCECE' : ''}`}}>
							<Link to="/hazardscontrol">{t(`menu.hazards`)}</Link>
						</li>
						}
						{(connectedUser.canListUnits) &&
						<li style={{backgroundColor: `${selectedMenu === 'units' ? '#FFCECE' : ''}`}}>
							<Link to="/unitcontrol">{t(`menu.units`)}</Link>
						</li>
						}{(connectedUser.canListOrganisms) &&
						<li style={{backgroundColor: `${selectedMenu === 'organisms' ? '#FFCECE' : ''}`}}>
							<Link to="/organismscontrol">{t(`menu.organisms`)}</Link>
						</li>
						}
						{(connectedUser.canListChemicals) &&
						<li style={{backgroundColor: `${selectedMenu === 'chemicalscontrol' ? '#FFCECE' : ''}`}}>
							<Link to="/chemicalscontrol">{t(`menu.chemicals`)}</Link>
						</li>
						}
						{(connectedUser.canListAuthorizations) &&
						<li style={{backgroundColor: `${selectedMenu === 'chemicalauthorizationscontrol' ? '#FFCECE' : ''}`}}>
							<Link to="/chemicalauthorizationscontrol">{t(`menu.authChem`)}</Link>
						</li>
						}
						{(connectedUser.canListAuthorizations) &&
						<li style={{backgroundColor: `${selectedMenu === 'radioprotectionauthorizationscontrol' ? '#FFCECE' : ''}`}}>
							<Link to="/radioprotectionauthorizationscontrol">{t(`menu.radioprotection`)}</Link>
						</li>
						}
						{connectedUser.isAdmin &&
						<li style={{backgroundColor: `${selectedMenu === 'hazardForms' ? '#FFCECE' : ''}`}}>
							<Link to="/hazardformcontrol">🛠️ {t(`menu.hazardFormControl`)}</Link>
						</li>
						}
						{(connectedUser.canListRooms) &&
				<>
					<li><a href={env().LHDv2_BASE_URL + "auth_DSPS/lhd_auth_dsps.php"}>Dispensations</a></li>
					<li><a href={env().LHDv2_BASE_URL + "cut/lhd_cut.php"}>Supplies interruptions</a></li>
					<li><a onClick={() => setOpenAudit(!openAudit)}>Audit</a>
						<ul style={{display: openAudit ? 'block' : 'none'}}>
							<li><a href={env().LHDv2_BASE_URL + "audit/lhd_audit.php"}>List of reports</a></li>
							<li><a href={env().LHDv2_BASE_URL + "audit_report/make_report/lhd_auditsR.php"}>Make audit
								report</a>
							</li>
							<li><a href={env().LHDv2_BASE_URL + "audit_report/make_nreport/lhd_auditsN.php"}>Make number
								of audit
								report</a></li>
						</ul>
					</li>
				</>
						}
						<li><a href={env().LHDv2_BASE_URL + "lhd_cosecs/barcodes/"}>LHD Barcode</a>
						</li>
						{(connectedUser.canListRooms) &&
				<>
					<li><a href={env().LHDv2_BASE_URL + "aa/aa_validation/lhd_aa_validation.php"}>Accred/Archibus</a>
					</li>
					<li><a onClick={() => setOpenUpdates(!openUpdates)}>Updates</a>
						<ul style={{display: openUpdates ? 'block' : 'none'}}>
							<li><a
								href={env().LHDv2_BASE_URL + "updates/update_auth_dsps/lhd_update_auth_dsps.php"}>Dispensations</a>
							</li>
						</ul>
					</li>
					<li><a onClick={() => setOpenLinks(!openLinks)}>Links</a>
						<ul style={{display: openLinks ? 'block' : 'none'}}>
							<li><a href="http://geoportail.epfl.ch" target="_blank">Geoportail</a></li>
							<li><a href="http://isic.epfl.ch/chemical-stores" target="_blank">Chemical stores</a></li>
						</ul>
					</li>
				</>
						}
					</ul>
				</Base.AsideMenu>
				<Base.Breadcrumbs>
					<li className="breadcrumb-item">Laboratory Hazards Directory</li>
				</Base.Breadcrumbs>
				<Base.User>
						<Box
							display="flex"
							flexDirection="row"
							alignItems="center"
							justifyContent="center"
							gridGap={4}
						>
							<LoginButton/>
							{/*<LanguageSwitcher/>*/}
						</Box>
				</Base.User>

				<div className="container-full" style={{width: '100%', padding: '1em'}}>
					<Switch>
						<Route path="/unitcontrol">
							<UnitControl handleCurrentPage={handleCurrentPage}
													 user={connectedUser}/>
						</Route>
						<Route path="/organismscontrol">
							<OrganismsControl handleCurrentPage={handleCurrentPage}
																user={connectedUser}/>
						</Route>
						<Route path="/unitdetails">
							<UnitDetails/>
						</Route>
						<Route path="/hazardformcontrol">
							<HazardFormControl handleCurrentPage={handleCurrentPage}
																 user={connectedUser}/>
						</Route>
						<Route path="/roomdetails">
							<RoomDetails />
						</Route>
						<Route path="/formdetails">
							<HazardFormDetails />
						</Route>
						<Route path="/hazardFormChildDetails">
							<HazardFormChildDetails />
						</Route>
						<Route path="/roomcontrol">
							<RoomControl handleCurrentPage={handleCurrentPage}
													 user={connectedUser}/>
						</Route>
						<Route path="/hazardscontrol">
							<HazardsControl handleCurrentPage={handleCurrentPage}
													 user={connectedUser}/>
						</Route>
						<Route path="/chemicalscontrol">
							<ChemicalsControl handleCurrentPage={handleCurrentPage}
															user={connectedUser}/>
						</Route>
						<Route path="/chemicalauthorizationscontrol">
							<ChemicalsAuthorizationControl handleCurrentPage={handleCurrentPage}
																user={connectedUser}/>
						</Route>
						<Route path="/radioprotectionauthorizationscontrol">
							<RadioprotectionsAuthorizationControl handleCurrentPage={handleCurrentPage}
																						 user={connectedUser}/>
						</Route>
					</Switch>
					<p style={{display: 'flex',justifyContent: 'end',fontSize: 'smaller',margin: '10px'}}>Version: {packageJson.version}</p>
				</div>
			</Base>
		</BrowserRouter>
		<Notifications
			open={openNotification}
			notification={notificationType}
			close={handleClose}
		/>
			</>
	);
}

export default App;
