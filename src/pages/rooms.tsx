import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import React, {useEffect, useState} from "react";
import {fetchRooms, fetchRoomsWithHazards} from "../utils/graphql/FetchingTools";
import {env} from "../utils/env";
import {Box, Typography, useMediaQuery} from "@material-ui/core";
import {EntriesTableCategory} from "../components/Table/EntriesTableCategory";
import {columnType, notificationType, personType, roomDetailsType} from "../utils/ressources/types";
import {useTranslation} from "react-i18next";
import {GridRenderCellParams} from "@mui/x-data-grid";
import {Button} from "epfl-elements-react/src/stories/molecules/Button.tsx";
import featherIcons from "epfl-elements/dist/icons/feather-sprite.svg";
import {AddNewRoomDialog} from "../components/RoomDetails/AddNewRoomDialog";
import {notificationsVariants} from "../utils/ressources/variants";
import Notifications from "../components/Table/Notifications";
import {MultipleAutocomplete} from "../components/global/MultipleAutocomplete";
import {useHistory, useLocation} from "react-router-dom";
import {readOrEditHazard} from "../utils/ressources/jsonUtils";
import {HazardList} from "../components/RoomDetails/HazardList";
import {FormCard} from "epfl-elements-react/src/stories/molecules/FormCard.tsx";

interface RoomControlProps {
	handleCurrentPage: (page: string) => void;
	isUserAuthorized: boolean;
}

export const RoomControl = ({
	handleCurrentPage,
	isUserAuthorized
}: RoomControlProps) => {
	const location = useLocation();
	const PAGE_SIZE = 100;
	const history = useHistory();
	const {t} = useTranslation();
	const oidc = useOpenIDConnectContext();
	const [tableData, setTableData] = useState<roomDetailsType[]>([]);
	const [loading, setLoading] = useState(false);
	const [totalCount, setTotalCount] = useState<number>(0);
	const [openDialog, setOpenDialog] = useState<boolean>(false);
	const [notificationType, setNotificationType] = useState<notificationType>({
		type: "info",
		text: '',
	});
	const [openNotification, setOpenNotification] = useState<boolean>(false);

	const isMediumDevice = useMediaQuery("only screen and (min-width : 769px) and (max-width : 992px)");
	const isLargeDevice = useMediaQuery("only screen and (min-width : 993px) and (max-width : 1200px)");
	const isExtraLargeDevice = useMediaQuery("only screen and (min-width : 1201px)");
	const [page, setPage] = useState<number>(0);
	const [search, setSearch] = React.useState<string>('');

	const columnsLarge: columnType[] = [
			{field: "name", headerName: t('room.name'), flex: 0.2},
			{field: "site", headerName: t('room.site'), flex: 0.2},
			{field: "building", headerName: t('room.building'), flex: 0.2},
			{field: "sector", headerName: t('room.sector'), flex: 0.1},
			{field: "floor", headerName: t('room.floor'), flex: 0.1},
			{field: "vol", headerName: t('room_details.vol'), flex: 0.2},
			{field: "kind", headerName: t('room.kind.name'), flex: 0.4, valueGetter: (params) => {
				if (params.row.kind && params.row.kind.name) {
					return params.row.kind.name;
				}
				return "";
			}},
		{field: "submissionList", headerName: t('room_details.hazards'), flex: 2, disableExport: true,
			renderCell: (params: GridRenderCellParams<any, roomDetailsType>) => (
				params.row.submissionList ? <HazardList key={params.row.id} submissionsList={params.row.submissionList} inRoomDetails={false}/> : <></>
			),
		},
		{field: "lhd_units", headerName: t('room.unit'), flex: 0.8, disableExport: true,
			renderCell: (params: GridRenderCellParams<any, roomDetailsType>) => (
				params.row.lhd_units ?
					<div className="form-card-div">
						{params.row.lhd_units.map(item => {
								return (
									<FormCard
										keyValue={item.name}
										key={item.name}
										style={{lineHeight: 'normal'}}>
										<div className="displayFlexColumn">
											<span className="text-muted" style={{fontWeight: "bold", fontSize: 'small'}}>
												{(item.institute?.school?.name ?? '').concat(' ').concat(item.institute?.name ?? '').concat(' ').concat(item.name)}
											</span>
											{
												<div className="displayFlexColumn">
													{item.cosecs && item.cosecs.length > 0 && <span style={{lineHeight: 'normal', fontSize: 'smaller'}}><b>Cosec:</b> {item.cosecs?.map((i: personType) => i.name.concat(' ').concat(i.surname)).join(', ')}</span>}
													{item.professors && item.professors.length > 0 && <span style={{lineHeight: 'normal', fontSize: 'smaller'}}><b>Prof:</b> {item.professors?.map((i: personType) => i.name.concat(' ').concat(i.surname)).join(', ')}</span>}
												</div>
											}
										</div>
									</FormCard>
								)
							}
						)}
					</div> : <></>
			),
		}

		/*{
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
	}*/
	];

	const columnsMedium: columnType[] = [
		{
			field: "name", headerName: t('room.name'), minWidth: 300,
			renderCell: (params: GridRenderCellParams<any, roomDetailsType>) => (
				<span style={{lineHeight: '20px', fontSize: "smaller"}}>
					<b>{params.row.name}</b>{` (${params.row.kind ? params.row.kind.name : ''})`}
					<br/>
					{`${(params.row.site ? params.row.site : '') +
					(params.row.building ? (',' + params.row.building) : '') +
					(params.row.sector ? (',' + params.row.sector) : '') +
					(params.row.floor ? (',' + params.row.floor) : '')}`}
					<br/>
					{params.row.lhd_units ?
						<div className="form-card-div">
							{params.row.lhd_units.map(item => {
									return (
										<FormCard
											keyValue={item.name}
											key={item.name}
											style={{lineHeight: 'normal'}}>
											<div className="displayFlexColumn">
											<span className="text-muted" style={{fontWeight: "bold", fontSize: 'small'}}>
												{(item.institute?.school?.name ?? '').concat(' ').concat(item.institute?.name ?? '').concat(' ').concat(item.name)}
											</span>
												{
													<div className="displayFlexColumn">
														{item.cosecs && item.cosecs.length > 0 && <span style={{lineHeight: 'normal', fontSize: 'smaller'}}><b>Cosec:</b> {item.cosecs?.map((i: personType) => i.name.concat(' ').concat(i.surname)).join(', ')}</span>}
														{item.professors && item.professors.length > 0 && <span style={{lineHeight: 'normal', fontSize: 'smaller'}}><b>Prof:</b> {item.professors?.map((i: personType) => i.name.concat(' ').concat(i.surname)).join(', ')}</span>}
													</div>
												}
											</div>
										</FormCard>
									)
								}
							)}
						</div> : <></>}
				</span>
			),
		},
		{
			field: "submissionList", headerName: t('room_details.hazards'), flex: 1, disableExport: true,
			renderCell: (params: GridRenderCellParams<any, roomDetailsType>) => (
				params.row.submissionList ?
					<HazardList key={params.row.id} submissionsList={params.row.submissionList} inRoomDetails={false}/> : <></>
			),
		}
		/*{
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
		}*/
	];

	const columnsSmall: columnType[] = [
		{
			field: "name", headerName: t('room.name'), flex: 1,
			renderCell: (params: GridRenderCellParams<any, roomDetailsType>) => (
				<div style={{lineHeight: '20px', fontSize: "smaller", display: "flex", flexDirection: 'column'}}>
					<span>
						<b>{params.row.name}</b>{` (${params.row.kind ? params.row.kind.name : ''})`}
					</span>
					<div style={{display: "flex", flexDirection: 'row'}}>
						{`${(params.row.site ? params.row.site : '') +
						(params.row.building ? (',' + params.row.building) : '') +
						(params.row.sector ? (',' + params.row.sector) : '') +
						(params.row.floor ? (',' + params.row.floor) : '')}`}
						{/*<div className="displayFlexRow" style={{justifyContent: 'center', marginLeft: '10px'}}>
							{
								params.row.hazardsListName.map(c =>
									<img style={{width: '20px', height: '20px', margin: '2px', marginLeft: '5px'}} key={`${c}_iconeKey`}
											 src={getHazardImage(c)}/>)
							}
						</div>*/}
					</div>
					<div>{params.row.lhd_units ?
						<div className="form-card-div">
							{params.row.lhd_units.map(item => {
									return (
										<FormCard
											keyValue={item.name}
											key={item.name}
											style={{lineHeight: 'normal'}}>
											<div className="displayFlexColumn">
											<span className="text-muted" style={{fontWeight: "bold", fontSize: 'small'}}>
												{(item.institute?.school?.name ?? '').concat(' ').concat(item.institute?.name ?? '').concat(' ').concat(item.name)}
											</span>
												{
													<div className="displayFlexColumn">
														{item.cosecs && item.cosecs.length > 0 && <span style={{lineHeight: 'normal', fontSize: 'smaller'}}><b>Cosec:</b> {item.cosecs?.map((i: personType) => i.name.concat(' ').concat(i.surname)).join(', ')}</span>}
														{item.professors && item.professors.length > 0 && <span style={{lineHeight: 'normal', fontSize: 'smaller'}}><b>Prof:</b> {item.professors?.map((i: personType) => i.name.concat(' ').concat(i.surname)).join(', ')}</span>}
													</div>
												}
											</div>
										</FormCard>
									)
								}
							)}
						</div> : <></>}</div>
					<div>{params.row.submissionList ? <HazardList key={params.row.id} submissionsList={params.row.submissionList} inRoomDetails={false}/> : <></>}</div>
				</div>
			),
		}
	];

	useEffect(() => {
		if (isUserAuthorized) {
			loadFetch();
		}
	}, [search, page, isUserAuthorized, location]);

	useEffect(() => {
		handleCurrentPage("rooms");
		setPage(0);
	}, [oidc.accessToken]);

	const loadFetch = async () => {
		if (page != undefined) {
			setLoading(true);
			const hazards = search && search != null ? (search.match(/Hazard/g)) : [];
			const numberOfSearchedHazards = hazards && hazards!=null ? hazards.length : 0;
			let results = {};
			if (numberOfSearchedHazards == 1) {
				results = await fetchRoomsWithHazards(
					env().REACT_APP_GRAPHQL_ENDPOINT_URL,
					oidc.accessToken,
					PAGE_SIZE,
					PAGE_SIZE * page,
					search ?? ''
				);
			} else {
				results = await fetchRooms(
					env().REACT_APP_GRAPHQL_ENDPOINT_URL,
					oidc.accessToken,
					PAGE_SIZE,
					PAGE_SIZE * page,
					search ?? ''
				);
			}

			if ( results.status && results.status === 200 && results.data ) {
				const roomsList: roomDetailsType[] = results.data.rooms;
				roomsList.forEach(r => {
					const listCat = r.hazards.map(h => h.hazard_form_history.hazard_form.hazard_category.hazard_category_name);
					r.hazardsListName = listCat.filter((q, idx) => listCat.indexOf(q) === idx);
					if (numberOfSearchedHazards == 1) {
						const match = search.match(/Hazard=([^&]*)/);
						const hazardValue = match ? match[1] : null;
						r.submissionList = readOrEditHazard(r, 'Read', null, false)
							.filter(h => h.category ? (h.category.toLowerCase().indexOf(hazardValue ? hazardValue.toLowerCase() : '') > -1) : true);
					}
				});
				setTableData(roomsList);
				setTotalCount(results.data.totalCount);
			} else {
				console.error('Bad GraphQL results', results);

				setNotificationType(notificationsVariants['bad_graphql_query']);
				setOpenNotification(true);
			}
			setLoading(false);
		}
	};

	const handleClose = () => {
		setOpenNotification(false);
	};

	return (
		<Box>
			{isUserAuthorized ? <>
			<Typography gutterBottom>
				{t(`room.roomList`)}
			</Typography>
			<div className="utilsBar">
				<MultipleAutocomplete
					setPage={setPage}
					setSearch={setSearch}
					parent="roomcontrol"
				/>
				{/*<DebounceInput
					key={search}
					input={search}
					id={search + "'_id"}
					onChange={onChangeInput}
					placeholder={t(`room.search`)}
					className="debounce-input"
				/>*/}
				<Button
					style={{minWidth: '10%', padding: '10px'}}
					onClick={() => setOpenDialog(true)}
					label={t(`generic.addNew`)}
					iconName={`${featherIcons}#plus-circle`}
					primary/>
			</div>
			<EntriesTableCategory
				tableData={tableData}
				columns={(isExtraLargeDevice || isLargeDevice) ? columnsLarge : (isMediumDevice ? columnsMedium : columnsSmall)}
				loading={loading}
				pageToOpen={"room"}
				loadServerRows={setPage}
				page={page}
				totalCount={totalCount}
				pageSize={PAGE_SIZE}
			/>
			<AddNewRoomDialog openDialog={openDialog} close={() => setOpenDialog(false)}
												save={(searchVal: string) => {
													setOpenDialog(false);
													setSearch(`Room=${encodeURIComponent(searchVal)}`);
													history.push(`/roomcontrol?Room=${encodeURIComponent(searchVal)}`);
												}}/>
			<Notifications
				open={openNotification}
				notification={notificationType}
				close={handleClose}
			/></> : <b>You are not authorized for this page</b>}
		</Box>
	);
}
