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
import {BackButton} from "../components/global/BackButton";
import {useHistory} from "react-router-dom";
import {getHazardImage} from "../components/RoomDetails/HazardProperties";

export default function RoomDetails() {
	const { t } = useTranslation();
	const history = useHistory();
	const oidc = useOpenIDConnectContext();
	const [data, setData] = useState<roomDetailsType | null>(null);
	const [listSavedCategories, setListSavedCategories] = useState<string[]>([]);

	useEffect(() => {
		loadFetch();
	}, [oidc.accessToken, window.location.search]);

	const loadFetch = async () => {
		const urlParams = new URLSearchParams(window.location.search);

		const results = await fetchRoomDetails(
			env().REACT_APP_GRAPHQL_ENDPOINT_URL,
			oidc.accessToken,
			decodeURIComponent(urlParams.get('room') as string),
			{}
		);
		if (results.status === 200 && results.data && typeof results.data !== 'string' && results.data[0]) {
			setData(results.data[0]);
			const listCat = results.data[0].hazards.map(h => h.hazard_form_history.hazard_form.hazard_category.hazard_category_name);
			const listCatFiltered = listCat.filter((q, idx) => listCat.indexOf(q) === idx);
			setListSavedCategories(listCatFiltered)
		} else {
			console.error('Bad GraphQL results', results);
		}
	}

	return (
		<Box>
			<BackButton icon="#arrow-left" onClickButton={() => {history.push("/roomcontrol")}} alwaysPresent={false}/>
			<Typography gutterBottom>{t(`room_details.title`).concat(data?.name)}</Typography>
			<Tabs>
				<Tabs.Tab id="details">
					<Tabs.Tab.Title>
						<span className="tab-text-title">{t(`room_details.details`)}</span>
					</Tabs.Tab.Title>
					<Tabs.Tab.Content>
						{data && <DetailsTab roomData={data} onSaveRoom={loadFetch}/>}
					</Tabs.Tab.Content>
				</Tabs.Tab>
				<Tabs.Tab id="hazards">
					<Tabs.Tab.Title>
						<div className="displayFlexColumn" style={{justifyContent: 'center'}}>
							<span className="tab-text-title">{t(`room_details.hazards`)}</span>
							{/*<div className="displayFlexRow" style={{justifyContent: 'center'}}>
								{listSavedCategories.map(c =>
									<img style={{width: '20px', height: '20px', margin: '10px'}} key={`${c}_iconeKey`}
											 src={getHazardImage(c)}/>)}
							</div>*/}
						</div>
					</Tabs.Tab.Title>
					<Tabs.Tab.Content>
						{data && <HazardTab room={data} onSaveRoom={loadFetch}/>}
					</Tabs.Tab.Content>
				</Tabs.Tab>
			</Tabs>
		</Box>
	);
}
