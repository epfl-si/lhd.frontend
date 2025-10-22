import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import React, {useEffect, useState} from "react";
import {fetchunitsFromFullTextAndPagination} from "../utils/graphql/FetchingTools";
import {env} from "../utils/env";
import {Box, Typography, useMediaQuery} from "@material-ui/core";
import {EntriesTableCategory} from "../components/Table/EntriesTableCategory";
import {columnType, lhdUnitsType, notificationType, organismType} from "../utils/ressources/types";
import {useTranslation} from "react-i18next";
import {GridRenderCellParams} from "@mui/x-data-grid";
import {Button, DebounceInput} from "epfl-elements-react-si-extra";
import {useHistory, useLocation} from "react-router-dom";
import "../../css/styles.scss";
import {AddNewUnitDialog} from "../components/Units/AddnewUnitDialog";
import {notificationsVariants} from "../utils/ressources/variants";
import Notifications from "../components/Table/Notifications";
import {DeleteUnitDialog} from "../components/Units/DeleteUnitDialog";

interface UnitControlProps {
	handleCurrentPage: (page: string) => void;
	user: any;
}

export const UnitControl = ({
	handleCurrentPage,
	user
}: UnitControlProps) => {
	const location = useLocation();
	const PAGE_SIZE = 100;
	const history = useHistory();
	const { t } = useTranslation();
	const oidc = useOpenIDConnectContext();
	const [openDialog, setOpenDialog] = useState<boolean>(false);
	const [tableData, setTableData] = useState<lhdUnitsType[]>([]);
	const [loading, setLoading] = useState(false);
	const [search, setSearch] = React.useState('');
	const [page, setPage] = useState<number>(0);
	const [totalCount, setTotalCount] = useState<number>(0);
	const [notificationType, setNotificationType] = useState<notificationType>({
		type: "info",
		text: '',
	});
	const isMediumDevice = useMediaQuery("only screen and (min-width : 769px) and (max-width : 992px)");
	const isLargeDevice = useMediaQuery("only screen and (min-width : 993px) and (max-width : 1200px)");
	const isExtraLargeDevice = useMediaQuery("only screen and (min-width : 1201px)");
	const [openNotification, setOpenNotification] = useState<boolean>(false);
	const [openDialogDelete, setOpenDialogDelete] = useState<boolean>(false);
	const [selectedUnit, setSelectedUnit] = useState<lhdUnitsType>();
	const [deleted, setDeleted] = useState(false);
	const columnsLarge: columnType[] = [
		{
			field: "unitId", headerName: t('unit.subUnit'), width: 100,
			renderCell: (params: GridRenderCellParams<any, lhdUnitsType>) => (
				params.row.unitId ? <></> :
					<>✔️</>
			)},
		{field: "name", headerName: t('unit.name'), width: 300,
			renderCell: (params: GridRenderCellParams<any, lhdUnitsType>) => (
				params.row.name
			)},
		{
			field: "institute", headerName: t('unit.institute'), width: 130,
			renderCell: (params: GridRenderCellParams<any, lhdUnitsType>) => {
				if (params.row.institute && params.row.institute.name) {
					return params.row.institute.name;
				}
				return "";
			}, valueGetter: (params) => {
				if (params.row.institute && params.row.institute.name) {
						return params.row.institute.name;
				}
				return "";
			}},
		{field: "school", headerName: t('unit.school'), width: 130,
			renderCell: (params: GridRenderCellParams<any, lhdUnitsType>) => {
				if (params.row.institute && params.row.institute.school && params.row.institute.school.name) {
					return params.row.institute.school.name;
				}
				return "";
			}, valueGetter: (params) => {
				if (params.row.institute && params.row.institute.school && params.row.institute.school.name) {
						return params.row.institute.school.name;
				}
				return "";
			}},
		{
			field: "professors", headerName: t('unit.prof'), width: 200,
			renderCell: (params: GridRenderCellParams<any, lhdUnitsType>) => {
				const professors = params.row.professors.map(c => c.name + ' ' + c.surname).join(', ');
				return <span style={{lineHeight: '20px', fontSize: "small"}}>
					{professors}
				</span>
			},
			valueGetter: (params: GridRenderCellParams<any, lhdUnitsType>) =>
				params.row.professors.map(c => c.name + ' ' + c.surname).join(', ')
		},
		{
			field: "cosecs", headerName: t('unit.cosec'), width: 200,
			renderCell: (params: GridRenderCellParams<any, lhdUnitsType>) => {
				const cosecs = params.row.cosecs.map(c => c.name + ' ' + c.surname).join(', ');
				return <span style={{lineHeight: '20px', fontSize: "small"}}>
					{cosecs}
				</span>
			},
			valueGetter: (params: GridRenderCellParams<any, lhdUnitsType>) =>
				params.row.cosecs.map(c => c.name + ' ' + c.surname).join(', ')
		},
		{field: "id", headerName: t('organism.actions'), width: 300, disableExport: true,
			renderCell: (params: GridRenderCellParams<any, lhdUnitsType>) => (
				user.canEditUnits ? <><Button size="icon"
									iconName={"#edit-3"}
									onClick={() => history.push(`/unitdetails?unit=${encodeURIComponent(params.row.name)}`)}/>
					<Button size="icon"
									style={{marginLeft: '10px'}}
									iconName={`#trash`}
									onClick={() => {
										setOpenDialogDelete(true);
										setSelectedUnit(params.row);
									}}/></> : <></>
			)
		},
	];

	const columnsMedium: columnType[] = [
		{
			field: "unitId", headerName: t('unit.subUnit'), width: 100,
			renderCell: (params: GridRenderCellParams<any, lhdUnitsType>) => (
				params.row.unitId ? <></> :
					<>✔️</>
			),
			valueFormatter: (params: GridRenderCellParams<any, organismType>) => {
				return params.value ? '' : '✔️';
			}
		},
		{
			field: "name", headerName: t('unit.name'), minWidth: 300,
			renderCell: (params: GridRenderCellParams<any, lhdUnitsType>) => {
				const names: string[] = [];
				if (params.row.institute && params.row.institute.name) {
					names.push(params.row.institute.name);
				}
				if (params.row.institute && params.row.institute.school && params.row.institute.school.name) {
					names.push(params.row.institute.school.name);
				}
				return <span style={{lineHeight: '20px', fontSize: "small"}}>
					<b>{params.row.name}</b>
					<br/>
					{names.join(', ')}
				</span>
			},
		},
		{
			field: "cosecs", headerName: t('unit.prof') + ' - ' + t('unit.cosec'), width: 200, disableExport: true,
			renderCell: (params: GridRenderCellParams<any, lhdUnitsType>) => {
				const cosecs = params.row.cosecs.map(c => c.name + ' ' + c.surname).join(', ');
				const professors = params.row.professors.map(c => c.name + ' ' + c.surname).join(', ');
				return <div style={{display: "flex", flexDirection:"column"}}><span style={{lineHeight: '20px', fontSize: "small"}}>
						{professors != '' ? <><span style={{fontWeight: "bold"}}>{t('unit.prof')} :</span>{professors}</> : ''}
					</span>
					<span style={{lineHeight: '20px', fontSize: "small"}}>
					{cosecs != '' ? <><span style={{fontWeight: "bold"}}>{t('unit.cosec')} :</span>{cosecs}</> : ''}
				</span></div>
			},
		},
		{field: "id", headerName: t('organism.actions'), width: 300, disableExport: true,
			renderCell: (params: GridRenderCellParams<any, lhdUnitsType>) => (
				user.canEditUnits ? <><Button size="icon"
									iconName={"#edit-3"}
									onClick={() => history.push(`/unitdetails?unit=${encodeURIComponent(params.row.name)}`)}/>
					<Button size="icon"
									style={{marginLeft: '10px'}}
									iconName={`#trash`}
									onClick={() => {
										setOpenDialogDelete(true);
										setSelectedUnit(params.row);
									}}/></> : <></>
			)
		},
	];

	const columnsSmall: columnType[] = [
		{
			field: "unitId", headerName: t('unit.subUnit'), width: 100,
			renderCell: (params: GridRenderCellParams<any, lhdUnitsType>) => (
				params.row.unitId ? <></> :
					<>✔️</>
			),
			valueFormatter: (params: GridRenderCellParams<any, organismType>) => {
				return params.value ? '' : '✔️';
			}
		},
		{
			field: "name", headerName: t('unit.name'), minWidth: 300,
			renderCell: (params: GridRenderCellParams<any, lhdUnitsType>) => {
				const names: string[] = [];
				const cosecs = params.row.cosecs.map(c => c.name + ' ' + c.surname).join(', ');
				const professors = params.row.professors.map(c => c.name + ' ' + c.surname).join(', ');
				if (params.row.institute && params.row.institute.name) {
					names.push(params.row.institute.name);
				}
				if (params.row.institute && params.row.institute.school && params.row.institute.school.name) {
					names.push(params.row.institute.school.name);
				}
				return <span style={{lineHeight: '20px', fontSize: "small"}}>
					<b>{params.row.name}</b>
					<br/>
					{names.join(', ')}
					<div style={{display: "flex", flexDirection: "column"}}><span
						style={{lineHeight: '20px', fontSize: "small"}}>
						{professors != '' ? <><span style={{fontWeight: "bold"}}>{t('unit.prof')} :</span>{professors}</> : ''}
					</span>
					<span style={{lineHeight: '20px', fontSize: "small"}}>
					{cosecs != '' ? <><span style={{fontWeight: "bold"}}>{t('unit.cosec')} :</span>{cosecs}</> : ''}
				</span></div>
				</span>
			},
		},
		{field: "id", headerName: t('organism.actions'), width: 300, disableExport: true,
			renderCell: (params: GridRenderCellParams<any, lhdUnitsType>) => (
				user.canEditUnits ? <><Button size="icon"
									iconName={"#edit-3"}
									onClick={() => history.push(`/unitdetails?unit=${encodeURIComponent(params.row.name)}`)}/>
					<Button size="icon"
									style={{marginLeft: '10px'}}
									iconName={`#trash`}
									onClick={() => {
										setOpenDialogDelete(true);
										setSelectedUnit(params.row);
									}}/></> : <></>
			)
		},
	];

	useEffect(() => {
		if (user.canListUnits) {
			loadFetch();
		}
		setDeleted(false);
	}, [search, page, user, deleted]);

	useEffect(() => {
		const urlParams = new URLSearchParams(location.search);
		if (urlParams.has('search')) {
			setSearch(decodeURIComponent(urlParams.get('search') as string));
		} else {
			setSearch('');
		}
		handleCurrentPage("units");
	}, [oidc.accessToken, location]);

	const loadFetch = async () => {
		setLoading(true);
		const results = await fetchunitsFromFullTextAndPagination(
			env().REACT_APP_GRAPHQL_ENDPOINT_URL,
			oidc.accessToken,
			PAGE_SIZE,
			PAGE_SIZE * page,
			search
		);
		if (results.status === 200 && results.data) {
			setTableData(results.data.units);
			setTotalCount(results.data.totalCount);
		} else {
			console.error('Bad GraphQL results', results);

			setNotificationType(notificationsVariants['bad_graphql_query']);
			setOpenNotification(true);
		}
		setLoading(false);
	};

	function onChangeInput(newValue: string) {
		const val = newValue ?? '';
		setSearch(val);
		history.push(`/unitcontrol?search=${encodeURIComponent(val)}`);
	}

	const handleClose = () => {
		setOpenNotification(false);
	};

	return (
		<Box>
			{user.canListUnits ? <>
			<Typography gutterBottom>
				{t(`unit.unitList`)}
			</Typography>
			<div className="utilsBar">
				<DebounceInput
					input={search}
					id={search + "'_id"}
					key={search + "'_id"}
					onChange={onChangeInput}
					placeholder={t(`unit.search`)}
					className="debounce-input"
				/>
				{user.canEditUnits && <Button
					onClick={() => setOpenDialog(true)}
					label={t(`generic.addNew`)}
					iconName={`#plus-circle`}
					primary/>}
			</div>
			<EntriesTableCategory
				tableData={tableData}
				columns={(isExtraLargeDevice || isLargeDevice) ? columnsLarge : (isMediumDevice ? columnsMedium : columnsSmall)}
				loading={loading}
				pageToOpen={"unit"}
				loadServerRows={setPage}
				page={page}
				totalCount={totalCount}
				pageSize={PAGE_SIZE}
			/>
				{user.canEditUnits && <><AddNewUnitDialog openDialog={openDialog} close={() => setOpenDialog(false)}
													 save={(searchVal: string) => {
														 setOpenDialog(false);
														 onChangeInput(searchVal);
													 }}/>
					<DeleteUnitDialog unit={selectedUnit}
				openDialog={openDialogDelete}
				setOpenDialog={setOpenDialogDelete}
				setDeleted={setDeleted}
			/></>}
			<Notifications
				open={openNotification}
				notification={notificationType}
				close={handleClose}
			/></> : <b>You are not authorized for this page</b>}
		</Box>
	);
}
