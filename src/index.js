import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Base } from '@epfl/epfl-sti-react-library';

ReactDOM.render(
	<React.StrictMode>
		<Base
			asideMenuItems={[
				{
					heading: 'Hazards',
					menus: [
						{ anchor: 'Bio hazard', link: '/' },
						{ anchor: 'Chem hazard', link: '/hellotabs' },
						{ anchor: 'Gas Hazard', link: '/hellovisualizations' },
					],
				},
				{
					heading: 'Authorisations',
					menus: [
						{ anchor: 'Toxic chems', link: '/' },
						{ anchor: 'OFSP', link: '/hellotabs' },
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
	</React.StrictMode>,
	document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
