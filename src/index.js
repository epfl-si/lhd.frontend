import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import reportWebVitals from './utils/web/reportWebVitals';
import { Base } from '@epfl/epfl-sti-react-library';
import './utils/lang/Dictionary';

ReactDOM.render(
	<>
		<Base
			asideMenuItems={[
				{
					heading: 'Hazards',
					menus: [
						{ anchor: 'Bio hazard', link: '/biohazard' },
						{ anchor: 'Chem hazard', link: '/chemhazard' },
						{ anchor: 'Gas Hazard', link: '/gazhazard' },
					],
				},
				{
					heading: 'Authorisations',
					menus: [
						{ anchor: 'Toxic chems', link: '/toxicchem' },
						{ anchor: 'OFSP', link: '/ofsp' },
					],
				},
				{
					heading: 'Dispensation',
					menus: [],
				},
				{
					heading: 'Etc...',
					menus: [],
				},
			]}
			baseTitle="LHD"
			breadcrumbItems={[{ anchor: 'LHD - LABORATORY HAZARDS DIRECTORY', link: '' }]}
			drawerContents={{ anchor: 'Go to main site', link: 'https://www.epfl.ch' }}
			homeAnchor="Home"
			homeLink="/"
			isBeta
			isHome
			showFooter
			useLightFooter
			title="Home"
			topMenuItems={[
				{ anchor: 'About', link: 'https://www.epfl.ch/about/' },
				{ anchor: 'Education', link: 'https://www.epfl.ch/education' },
				{ anchor: 'Research', link: 'https://www.epfl.ch/research' },
				{ anchor: 'Innovation', link: 'https://www.epfl.ch/innovation/' },
				{ anchor: 'Schools', link: 'https://www.epfl.ch/schools/' },
				{ anchor: 'Campus', link: 'https://www.epfl.ch/campus/' },
			]}
		>
			<div
				className="container-full"
				style={{
					width: '100%',
					padding: '1em',
				}}
			>
				<App />
			</div>
		</Base>
	</>,
	document.getElementById('root')
);

reportWebVitals();
