import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import reportWebVitals from './utils/web/reportWebVitals';
import { Base } from '@epfl/epfl-sti-react-library';

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
			baseTitle="EPFL STI React Library"
			breadcrumbItems={[
				{ anchor: '...', link: 'https://www.epfl.ch/schools/' },
				{ anchor: '...', link: 'https://sti.epfl.ch/' },
				{ anchor: 'LHD - LABORATORY HAZARDS DIRECTORY', link: '' },
			]}
			drawerContents={{ anchor: 'Go to main site', link: 'https://www.epfl.ch' }}
			homeAnchor="Home"
			homeLink="/"
			isBeta
			isHome
			showFooter
			title="Base Component - Default"
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

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
