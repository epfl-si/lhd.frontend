import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import React, {useEffect, useState} from "react";
import {fetchRooms} from "../utils/graphql/FetchingTools";
import {env} from "../utils/env";
import {Box, Typography} from "@material-ui/core";
import {EntriesTableCategory} from "../components/Table/EntriesTableCategory";
import {columnType, parameterType, roomDetailsType} from "../utils/ressources/types";
import {useTranslation} from "react-i18next";
import {GridRenderCellParams} from "@mui/x-data-grid";
import {getHazardImage} from "../components/RoomDetails/HazardProperties";

export default function RoomControl() {
	const {t} = useTranslation();
	const oidc = useOpenIDConnectContext();
	const [tableData, setTableData] = useState<roomDetailsType[]>([]);
	const [optionsList, setOptionsList] = useState<parameterType[]>([]);
	const [loading, setLoading] = useState(false);
	const columns: columnType[] = [
			{field: "name", headerName: t('room.name'), width: 230},
			{field: "building", headerName: t('room.building'), width: 230},
			{field: "sector", headerName: t('room.sector'), width: 230},
			{field: "floor", headerName: t('room.floor'), width: 230},
			{field: "kind", headerName: t('room.kind.name'), width: 230, valueGetter: (params) => {
				if (params.row.kind && params.row.kind.name) {
					return params.row.kind.name;
				}
				return "";
			}},
			{
				field: "hazardsListName", headerName: t('room_details.hazards'), width: 300,
				renderCell: (params: GridRenderCellParams<any, roomDetailsType>) => (
					<div className="displayFlexRow" style={{justifyContent: 'center'}}>
						{
							params.row.hazardsListName.map(c =>
								<img style={{width: '20px', height: '20px', margin: '10px'}} key={`${c}_iconeKey`}
										 src={getHazardImage(c)}/>)
						}
					</div>
				),
			}
	];

	useEffect(() => {
		const loadFetch = async () => {
			setLoading(true);
			const results = await fetchRooms(
				env().REACT_APP_GRAPHQL_ENDPOINT_URL,
				oidc.accessToken
			);
			if ( results.status === 200 ) {
				if ( results.data && !(results.data instanceof String)) {
					const roomsList: roomDetailsType[] = results.data;
					roomsList.forEach(r => {
						const listCat = r.hazards.map(h => h.hazard_form_history.hazard_form.hazard_category.hazard_category_name);
						r.hazardsListName = listCat.filter((q, idx) => listCat.indexOf(q) === idx);
					});
					setTableData(roomsList);
				} else {
					console.error('Bad GraphQL results', results);
				}
			}
			setLoading(false);
		};
		loadFetch();
	}, [oidc.accessToken]);

	return (
		<Box>
			<Typography gutterBottom>
				{t(`room.roomList`)}
			</Typography>
			<EntriesTableCategory
				optionsList={optionsList}
				tableData={tableData}
				columns={columns}
				loading={loading}
				page={"room"}
			/>
		</Box>
	);
}
