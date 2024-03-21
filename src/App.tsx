import React, {useEffect, useState} from 'react';
import {Base} from 'epfl-elements-react/src/Base';
import {Avatar} from 'epfl-elements-react/src/Avatar';
import {BrowserRouter, Link, Route, Switch} from 'react-router-dom';
import BioHazard from './pages/biohazard';
import {HomePage} from './pages/homepage';
import {LoginButton, StateEnum, useOpenIDConnectContext,} from '@epfl-si/react-appauth';
import {Box, Dialog, DialogActions, DialogContent, DialogTitle,} from '@material-ui/core';
import {Alert} from '@mui/material';
import {useTranslation} from 'react-i18next';
import LanguageSwitcher from './components/Table/LanguageSwitcher';
import RoomDetails from './pages/roomdetails';
import DispensationControls from './pages/dispensationcontrols';
import UnitControl from "./pages/units";
import UnitDetails from "./pages/unitdetails";
import HazardFormControl from "./pages/hazardFormControl";
import HazardFormDetails from "./pages/hazardformdetails";
import RoomControl from "./pages/rooms";

function App() {
	const { t } = useTranslation();
	const oidc = useOpenIDConnectContext();
	const isLoggedIn = oidc.state === StateEnum.LoggedIn;
	const [selectedMenu, setSelectedMenu] = useState<string>('rooms');

	const handlerMenuColor = (page: string) => {
		//<!--  <HomePage handleCurrentPage={handlerMenuColor}/> -->
		setSelectedMenu(page);
	}

	if (!isLoggedIn) {
		return (
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
		);
	}
	return (
		<BrowserRouter>
			<Base>
				<Base.AsideMenu>
					<ul>
						<li style={{backgroundColor: `${selectedMenu == 'rooms' ? 'FFCECE' : ''}`}}>
							<Link to="/">{t(`menu.rooms`)}</Link>
						</li>
						<li style={{backgroundColor: `${selectedMenu == 'units' ? 'FFCECE' : ''}`}}>
							<Link to="/unitcontrol">{t(`menu.units`)}</Link>
						</li>
						<li style={{backgroundColor: `${selectedMenu == 'dispensations' ? 'FFCECE' : ''}`}}>
							<Link to="/dispcontrol">{t(`menu.dispensations`)}</Link>
						</li>
						<li style={{backgroundColor: `${selectedMenu == 'hazardForms' ? 'FFCECE' : ''}`}}>
							<Link to="/hazardFormControl">{t(`menu.hazardFormControl`)}</Link>
						</li>
					</ul>
				</Base.AsideMenu>
				<Base.Breadcrumbs>
					<li className="breadcrumb-item">Laboratory Hazards Directory</li>
				</Base.Breadcrumbs>
				<Base.User>
					<Avatar>
						<Avatar.Image peopleSciper={'169419'}/>
						<Box
							display="flex"
							flexDirection="row"
							alignItems="center"
							justifyContent="center"
							gridGap={4}
						>
							<LoginButton/>
							<LanguageSwitcher/>
						</Box>
					</Avatar>
				</Base.User>

				<div className="container-full" style={{width: '100%', padding: '1em'}}>
					<Switch>
					<Route path="/unitcontrol">
							<UnitControl />
						</Route>
						<Route path="/unitdetails">
							<UnitDetails />
						</Route>
						<Route path="/dispcontrol">
							<DispensationControls />
						</Route>
						<Route path="/hazardFormControl">
							<HazardFormControl />
						</Route>
						<Route path="/roomdetails">
							<RoomDetails />
						</Route>
						<Route path="/formdetails">
							<HazardFormDetails />
						</Route>
						<Route path="/biohazard">
							<BioHazard />
						</Route>
						<Route path="/">
							<RoomControl />
						</Route>
					</Switch>
				</div>
			</Base>
		</BrowserRouter>
	);
}

export default App;
