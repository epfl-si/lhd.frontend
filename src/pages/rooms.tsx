import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import React, {useEffect, useState} from "react";
import {fetchRooms, fetchSearchHistory} from "../utils/graphql/FetchingTools";
import {env} from "../utils/env";
import {Box, Typography, useMediaQuery} from "@material-ui/core";
import {EntriesTableCategory} from "../components/Table/EntriesTableCategory";
import {columnType, parameterType, roomDetailsType} from "../utils/ressources/types";
import {useTranslation} from "react-i18next";
import {GridRenderCellParams} from "@mui/x-data-grid";
import {getHazardImage} from "../components/RoomDetails/HazardProperties";
import {DebounceInput} from "epfl-elements-react/src/stories/molecules/inputFields/DebounceInput.tsx";
import {createNewSearchForUser, updateRoom} from "../utils/graphql/PostingTools";

interface RoomControlProps {
	handleCurrentPage: (page: string) => void;
	user: number;
}

export const RoomControl = ({
	handleCurrentPage,
	user
}: RoomControlProps) => {
	const PAGE_SIZE = 100;
	const {t} = useTranslation();
	const oidc = useOpenIDConnectContext();
	const [tableData, setTableData] = useState<roomDetailsType[]>([]);
	const [loading, setLoading] = useState(false);
	const [search, setSearch] = React.useState('');
	const [page, setPage] = useState<number>(0);
	const [totalCount, setTotalCount] = useState<number>(0);

	const isSmallDevice = useMediaQuery("only screen and (max-width : 768px)");
	const isMediumDevice = useMediaQuery("only screen and (min-width : 769px) and (max-width : 992px)");
	const isLargeDevice = useMediaQuery("only screen and (min-width : 993px) and (max-width : 1200px)");
	const isExtraLargeDevice = useMediaQuery("only screen and (min-width : 1201px)");

	const columnsLarge: columnType[] = [
			{field: "name", headerName: t('room.name'), width: 150},
			{field: "building", headerName: t('room.building'), width: 100},
			{field: "sector", headerName: t('room.sector'), width: 100},
			{field: "floor", headerName: t('room.floor'), width: 100},
			{field: "kind", headerName: t('room.kind.name'), width: 200, valueGetter: (params) => {
				if (params.row.kind && params.row.kind.name) {
					return params.row.kind.name;
				}
				return "";
			}},
			{
				field: "hazardsListName", headerName: t('room_details.hazards'), minWidth: 300,
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

	const columnsMedium: columnType[] = [
		{
			field: "name", headerName: t('room.name'), minWidth: 300,
			renderCell: (params: GridRenderCellParams<any, roomDetailsType>) => (
				<span style={{lineHeight: '20px', fontSize: "smaller"}}>
					<b>{params.row.name}</b>{` (${params.row.kind ? params.row.kind.name : ''})`}
					<br/>
					{`${(params.row.building ? params.row.building : '') + 
					(params.row.sector ? (',' + params.row.sector) : '') + 
					(params.row.floor ? (',' +params.row.floor) : '')}`}
				</span>
			),
		},
		{
			field: "hazardsListName", headerName: t('room_details.hazards'), minWidth: 300,
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

	const columnsSmall: columnType[] = [
		{
			field: "name", headerName: t('room.name'), minWidth: 300,
			renderCell: (params: GridRenderCellParams<any, roomDetailsType>) => (
				<div style={{lineHeight: '20px', fontSize: "smaller", display: "flex", flexDirection: 'column'}}>
					<span>
						<b>{params.row.name}</b>{` (${params.row.kind ? params.row.kind.name : ''})`}
					</span>
					<div style={{display: "flex", flexDirection: 'row'}}>
						{`${(params.row.building ? params.row.building : '') +
						(params.row.sector ? (',' + params.row.sector) : '') +
						(params.row.floor ? (',' + params.row.floor) : '')}`}
						<div className="displayFlexRow" style={{justifyContent: 'center', marginLeft: '10px'}}>
							{
								params.row.hazardsListName.map(c =>
									<img style={{width: '20px', height: '20px', margin: '2px', marginLeft: '5px'}} key={`${c}_iconeKey`}
											 src={getHazardImage(c)}/>)
							}
						</div>
					</div>
				</div>
			),
		}
	];

	useEffect(() => {
		loadFetch(0);
	}, [search]);

	useEffect(() => {
		loadSearchHistory();
		handleCurrentPage("rooms");
	}, [oidc.accessToken]);

	const loadSearchHistory = async () => {
		const results = await fetchSearchHistory(
			env().REACT_APP_GRAPHQL_ENDPOINT_URL,
			oidc.accessToken,
			user,
			'rooms'
		);
		if ( results.status === 200 && results.data && results.data[0] ) {
			setSearch(results.data[0].search);
		} else {
			console.error('Bad GraphQL results', results);
		}
	};

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
		if ( results.status === 200 && results.data ) {
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
		const val = newValue ?? '';
		saveNewSearch(val);
		setSearch(val);
	}

	async function saveNewSearch(val: string) {
		await createNewSearchForUser(
			env().REACT_APP_GRAPHQL_ENDPOINT_URL,
			oidc.accessToken,
			user,
			'rooms',
			val
		)
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
				columns={(isExtraLargeDevice || isLargeDevice) ? columnsLarge : (isMediumDevice ? columnsMedium : columnsSmall)}
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