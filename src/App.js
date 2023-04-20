import { Base, Asidemenu } from '@epfl/epfl-sti-react-library';
import { BrowserRouter, Switch, Route, Link } from 'react-router-dom';
import BioHazard from './pages/biohazard';
import HomePage from './pages/homepage';

function App() {
	return (
		<div className="App">
			<BrowserRouter>
				<Base
					baseTitle="LHD"
					breadcrumbItems={[
						{ anchor: 'LHD - LABORATORY HAZARDS DIRECTORY', link: '' },
					]}
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
					<div className="nav-toggle-layout nav-aside-layout">
						<aside className="nav-aside-wrapper">
							<nav
								className="nav-aside"
								id="nav-aside"
								role="navigation"
								aria-describedby="nav-aside-title"
							>
								<ul>
									<li>Hazards</li>
									<li>
										<ul>
											<li>
												<Link to="/">Home</Link>
											</li>
											<li>
												<Link to="/biohazard">Bio hazards</Link>
											</li>
										</ul>
									</li>
								</ul>
							</nav>
						</aside>
					</div>
					<div
						className="container-full"
						style={{
							width: '100%',
							padding: '1em',
						}}
					>
						<Switch>
							<Route path="/biohazard">
								<NothingHereNow />
							</Route>
							<Route path="/">
								<HomePage />
							</Route>
						</Switch>
					</div>
				</Base>
			</BrowserRouter>
		</div>
	);
}

export default App;

function NothingHereNow() {
	return (
		<div>
			<Link to="/">NothingHereNow</Link>
		</div>
	);
}
