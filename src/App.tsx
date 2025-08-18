import React, {useEffect, useState} from 'react';
import {Base} from 'epfl-elements-react/src/Base';
import {Avatar} from 'epfl-elements-react/src/Avatar';
import {BrowserRouter, Link, Route, Switch} from 'react-router-dom';
import {LoginButton, StateEnum, useOpenIDConnectContext,} from '@epfl-si/react-appauth';
import {Box, Dialog, DialogActions, DialogContent, DialogTitle,} from '@material-ui/core';
import {Alert} from '@mui/material';
import {useTranslation} from 'react-i18next';
import LanguageSwitcher from './components/Table/LanguageSwitcher';
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

function App() {
	const { t } = useTranslation();
	const oidc = useOpenIDConnectContext();
	const isLoggedIn = oidc.state === StateEnum.LoggedIn;
	const [selectedMenu, setSelectedMenu] = useState<string>('rooms');
	const [connectedUser, setConnectedUser] = useState<object>({userName: '', groups: []});

	useEffect(() => {
		if (isLoggedIn) {
			loadFetch();
		}
	}, [oidc.accessToken, isLoggedIn, selectedMenu]);

	const loadFetch = async () => {
		const results = await fetchConnectedUser(
			env().REACT_APP_GRAPHQL_ENDPOINT_URL,
			oidc.accessToken
		);
		if (results.status === 200 && results.data) {
			console.log('ConnectedUser',results.data);
			setConnectedUser({userName: results.data.preferred_username, groups: results.data.groups});
		}
	};

	const handleCurrentPage = (page: string) => {
		setSelectedMenu(page);
	}

	const [openCadastre, setOpenCadastre] = useState(false);
	const [openAuthorisations, setOpenAuthorisations] = useState(false);
	const [openAudit, setOpenAudit] = useState(false);
	const [openUpdates, setOpenUpdates] = useState(false);
	const [openLinks, setOpenLinks] = useState(false);

	if (!isLoggedIn) {
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
		<BrowserRouter>
			<Base>
				<Base.AsideMenu>
					<ul>
						{(connectedUser.groups.includes('LHD_acces_admin') || connectedUser.groups.includes('LHD_acces_lecture')) &&
						<li style={{backgroundColor: `${selectedMenu == 'rooms' ? '#FFCECE' : ''}`}}>
							<Link to="/roomcontrol">{t(`menu.rooms`)}</Link>
						</li>
						}
						{(connectedUser.groups.includes('LHD_acces_admin') || connectedUser.groups.includes('LHD_acces_lecture')) &&
						<li style={{backgroundColor: `${selectedMenu == 'hazards' ? '#FFCECE' : ''}`}}>
							<Link to="/hazardscontrol">{t(`menu.hazards`)}</Link>
						</li>
						}
						{(connectedUser.groups.includes('LHD_acces_admin') || connectedUser.groups.includes('LHD_acces_lecture')) &&
						<li style={{backgroundColor: `${selectedMenu == 'units' ? '#FFCECE' : ''}`}}>
							<Link to="/unitcontrol">{t(`menu.units`)}</Link>
						</li>
						}
						<li style={{backgroundColor: `${selectedMenu == 'organisms' ? '#FFCECE' : ''}`}}>
							<Link to="/organismscontrol">{t(`menu.organisms`)}</Link>
						</li>
						{(connectedUser.groups.includes('LHD_acces_admin') || connectedUser.groups.includes('LHD_acces_lecture')) &&
						<li style={{backgroundColor: `${selectedMenu == 'chemicals' ? '#FFCECE' : ''}`}}>
							<Link to="/chemicalscontrol">{t(`menu.chemicals`)}</Link>
						</li>
						}
						{connectedUser.groups.includes('LHD_acces_admin') &&
						<li style={{backgroundColor: `${selectedMenu == 'hazardForms' ? '#FFCECE' : ''}`}}>
							<Link to="/hazardformcontrol">🛠️ {t(`menu.hazardFormControl`)}</Link>
						</li>
						}
						{(connectedUser.groups.includes('LHD_acces_admin') || connectedUser.groups.includes('LHD_acces_lecture')) &&
				<>
					<li><a onClick={() => setOpenAuthorisations(!openAuthorisations)}>Authorisations</a>
						<ul style={{display: openAuthorisations ? 'block' : 'none'}}>
							<li><a href={env().LHDv2_BASE_URL + "auth_SST/lhd_auth_SST.php"}>Toxic Chemicals</a></li>
							<li><a href={env().LHDv2_BASE_URL + "auth_OFSP/lhd_auth_OFSP.php"}>OFSP/IFSN</a></li>
						</ul>
					</li>
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
						{(connectedUser.groups.includes('LHD_acces_admin') || connectedUser.groups.includes('LHD_acces_lecture')) &&
				<>
					<li><a href={env().LHDv2_BASE_URL + "aa/aa_validation/lhd_aa_validation.php"}>Accred/Archibus</a>
					</li>
					<li><a onClick={() => setOpenUpdates(!openUpdates)}>Updates</a>
						<ul style={{display: openUpdates ? 'block' : 'none'}}>
							<li><a
								href={env().LHDv2_BASE_URL + "updates/update_auth_sst_list/lhd_update_auth_sst_list.php"}>Toxic
								Chemicals</a></li>
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
					<Avatar>
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
					</Avatar>
				</Base.User>

				<div className="container-full" style={{width: '100%', padding: '1em'}}>
					<Switch>
						<Route path="/unitcontrol">
						<UnitControl handleCurrentPage={handleCurrentPage}
												 isUserAuthorized={connectedUser.groups.includes('LHD_acces_admin') || connectedUser.groups.includes('LHD_acces_lecture')}/>
						</Route>
						<Route path="/organismscontrol">
							<OrganismsControl handleCurrentPage={handleCurrentPage}
																isUserAuthorized={connectedUser.groups.includes('LHD_acces_admin') || connectedUser.groups.includes('LHD_acces_lecture')}/>
						</Route>
						<Route path="/unitdetails">
							<UnitDetails/>
						</Route>
						<Route path="/hazardformcontrol">
							<HazardFormControl handleCurrentPage={handleCurrentPage}
																 isUserAuthorized={connectedUser.groups.includes('LHD_acces_admin')}/>
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
													 isUserAuthorized={connectedUser.groups.includes('LHD_acces_admin') || connectedUser.groups.includes('LHD_acces_lecture')}/>
						</Route>
						<Route path="/hazardscontrol">
							<HazardsControl handleCurrentPage={handleCurrentPage}
													 isUserAuthorized={connectedUser.groups.includes('LHD_acces_admin') || connectedUser.groups.includes('LHD_acces_lecture')}/>
						</Route>
						<Route path="/chemicalscontrol">
							<ChemicalsControl handleCurrentPage={handleCurrentPage}
															isUserAuthorized={connectedUser.groups.includes('LHD_acces_admin') || connectedUser.groups.includes('LHD_acces_lecture')}/>
						</Route>
					</Switch>
				</div>
			</Base>
		</BrowserRouter>
	);
}

export default App;
