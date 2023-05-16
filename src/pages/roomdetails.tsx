import { Box, Card, CardContent, Typography } from '@material-ui/core';
import { Stack } from '@mui/material';
import React, { useEffect, useState } from 'react';
import DetailRow from '../components/RoomDetails/DetailRow';
import DetailDrawer from '../components/RoomDetails/DetailDrawer';
import { fetchRoomDetails } from '../utils/graphql/FetchingTools';
import { env } from '../utils/env.js';
import { useOpenIDConnectContext } from '@epfl-si/react-appauth';
import { roomDetailsType } from '../utils/ressources/types';
import DispensationTable from '../components/RoomDetails/DispensationTable';

export default function RoomDetails() {
	const oidc = useOpenIDConnectContext();
	const [data, setData] = useState<roomDetailsType[]>([]);

	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const loadFetch = async () => {
			const results = await fetchRoomDetails(
				env().REACT_APP_GRAPHQL_ENDPOINT_URL,
				oidc.accessToken,
				urlParams.get('room'),
				{}
			);
			if (results.status === 200) {
				if (results.data) {
					if (typeof results.data !== 'string') {
						setData(results.data);
					}
				} else {
					console.error('Bad GraphQL results', results);
				}
			}
			console.log(results);
		};
		loadFetch();
	}, [oidc.accessToken]);

	return (
		<Box
			display="flex"
			justifyContent="center"
			alignItems="center"
			flexDirection="column"
			gridGap={16}
		>
			<Typography variant="h3">Details on room {data[0]?.name}</Typography>
			<Card style={{ minWidth: 350, width: '30%' }}>
				<CardContent>
					<Typography variant="caption">Basic information on room</Typography>
					<Stack>
						<DetailRow title="Designation" value={data[0]?.kind?.name} />
						<DetailRow
							title="Cosec"
							value={data[0]?.occupancies[0]?.cosecs?.map(e => e.name).join(', ')}
						/>
						<DetailRow
							title="Professor/Responsible"
							value={data[0]?.occupancies[0]?.professors
								?.map(e => e.name)
								.join(', ')}
						/>
						<DetailRow title="Unit" value={data[0]?.occupancies[0]?.unit?.name} />
						<DetailRow
							title="Number of audits per year"
							value={data[0]?.yearly_audits?.toString()}
						/>
					</Stack>
				</CardContent>
			</Card>
			<Box width="100%">
				<DetailDrawer title="Audit Reports">none</DetailDrawer>
				<DetailDrawer title="Hazards">none</DetailDrawer>
				<DetailDrawer title="Authorisations">none</DetailDrawer>
				<DetailDrawer title="Dispensations">
					{data[0]?.dispensations?.length !== 0 && (
						<DispensationTable data={data[0]?.dispensations} />
					)}
				</DetailDrawer>
				<DetailDrawer title="Cadastre">none</DetailDrawer>
				<DetailDrawer title="Supplies interruptions">none</DetailDrawer>
			</Box>
		</Box>
	);
}
// dispensations {
// 	slug
// 	versions {
// 		subject
// 		date_end
// 		status
// 		holders {
// 			name
// 		}
// 	}
// }
