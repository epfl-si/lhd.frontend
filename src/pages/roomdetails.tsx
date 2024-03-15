import {Box, Typography} from '@material-ui/core';
import React, {useEffect, useState} from 'react';
import {fetchRoomDetails} from '../utils/graphql/FetchingTools';
import {env} from '../utils/env.js';
import {useOpenIDConnectContext} from '@epfl-si/react-appauth';
import {roomDetailsType} from '../utils/ressources/types';
import {Tabs} from 'epfl-elements-react/src/stories/molecules/Tabs.tsx';
import '../../css/styles.scss'
import "epfl-elements-react/src/stories/molecules/formCard.css";
import featherIcons from "epfl-elements/dist/icons/feather-sprite.svg";
import {useTranslation} from "react-i18next";
import "formiojs/dist/formio.full.min.css";
import {HazardTab} from "../components/RoomDetails/HazardTab";
import {DetailsTab} from "../components/RoomDetails/DetailsTab";

export default function RoomDetails() {
	const { t } = useTranslation();
	const oidc = useOpenIDConnectContext();
	const [data, setData] = useState<roomDetailsType | null>(null);

	useEffect(() => {
		
		loadFetch();
	}, [oidc.accessToken, window.location.search]);

	const loadFetch = async () => {
		const urlParams = new URLSearchParams(window.location.search);

		const results = await fetchRoomDetails(
			env().REACT_APP_GRAPHQL_ENDPOINT_URL,
			oidc.accessToken,
			urlParams.get('room'),
			{}
		);
		if (results.status === 200 && results.data && typeof results.data !== 'string' && results.data[0]) {
			setData(results.data[0]);
		} else {
			console.error('Bad GraphQL results', results);
		}
	}
	
	const onSaveRoom = () => {
		loadFetch();
	}
	
	return (
		<Box>
			<Typography variant="h5" gutterBottom>{t(`room_details.title`).concat(data?.name)}</Typography>
			<Tabs>
				<Tabs.Tab id="details">
					<Tabs.Tab.Title>
						<div style={{display: 'flex', justifyContent: 'center'}}>
							<svg aria-hidden="true" className="icon feather" style={{margin: '3px'}}>
								<use xlinkHref={`${featherIcons}#users`}></use>
							</svg>
							<span className="tab-text-title">{t(`room_details.details`)}</span>
						</div>
					</Tabs.Tab.Title>
					<Tabs.Tab.Content>
						{data && <DetailsTab roomData={data} />}
					</Tabs.Tab.Content>
				</Tabs.Tab>
				<Tabs.Tab id="hazards">
					<Tabs.Tab.Title>
						<div style={{display: 'flex', justifyContent: 'center', flexDirection: "column"}}>
							<div>
								<svg aria-hidden="true" className="icon feather" style={{margin: '3px'}}>
									<use xlinkHref={`${featherIcons}#users`}></use>
								</svg>
								<span className="tab-text-title">{t(`room_details.hazards`)}</span>
							</div>
							<div style={{display: "flex", justifyContent: "center"}}>
								<img style={{margin: '5px', width: '30px', height: '30px'}}
										 src="../../public/pictogrammes/02_radiation_ionisante.svg"/>
							</div>
						</div>
					</Tabs.Tab.Title>
					<Tabs.Tab.Content>
						{data && <HazardTab room={data}  onSaveRoom={onSaveRoom}/>}
					</Tabs.Tab.Content>
				</Tabs.Tab>
			</Tabs>
		</Box>
	);
}
