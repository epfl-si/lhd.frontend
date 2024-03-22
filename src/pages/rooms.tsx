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
import {DebounceInput} from "epfl-elements-react/src/stories/molecules/inputFields/DebounceInput.tsx";

export default function RoomControl() {
	const PAGE_SIZE = 100;
	const {t} = useTranslation();
	const oidc = useOpenIDConnectContext();
	const [tableData, setTableData] = useState<roomDetailsType[]>([]);
	const [loading, setLoading] = useState(false);
	const [search, setSearch] = React.useState('');
	const [page, setPage] = useState<number>(0);
	const [totalCount, setTotalCount] = useState<number>(0);
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
								<img style={{width: '30px', height: '30px', margin: '5px'}} key={`${c}_iconeKey`}
										 src={getHazardImage(c)}/>)
						}
					</div>
				),
			}
	];

	useEffect(() => {
		loadFetch(0);
	}, [oidc.accessToken, search]);

	const loadFetch = async (newPage: number) => {
		setPage(newPage);
		setLoading(true);
		const results = await fetchRooms(
			env().REACT_APP_GRAPHQL_ENDPOINT_URL,
			oidc.accessToken,
			PAGE_SIZE,
			PAGE_SIZE * newPage,
			search
		);
		if ( results.status === 200 && results.data) {
			const roomsList: roomDetailsType[] = results.data.rooms;
			roomsList.forEach(r => {
				const listCat = r.hazards.map(h => h.hazard_form_history.hazard_form.hazard_category.hazard_category_name);
				r.hazardsListName = listCat.filter((q, idx) => listCat.indexOf(q) === idx);
			});
			setTableData(roomsList);
			setTotalCount(results.data.totalCount);
		} else {
			console.error('Bad GraphQL results', results);
		}
		setLoading(false);
	};

	function onChangeInput(newValue: string) {
		if (newValue) {
			setSearch(newValue);
		} else {
			setSearch('');
		}
	}

	return (
		<Box>
			<Typography gutterBottom>
				{t(`room.roomList`)}
			</Typography>
			<DebounceInput
				input={search}
				id="member"
				onChange={onChangeInput}
				placeholder={t(`unit.search`)}
				className="debounce-input"
			/>
			<EntriesTableCategory
				tableData={tableData}
				columns={columns}
				loading={loading}
				pageToOpen={"room"}
				loadServerRows={loadFetch}
				page={page}
				totalCount={totalCount}
				pageSize={PAGE_SIZE}
			/>
		</Box>
	);
}
