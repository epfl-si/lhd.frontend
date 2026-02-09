import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import React, {useEffect, useState} from "react";
import {fetchHazards, fetchOrganismsFromFullText} from "../utils/graphql/FetchingTools";
import {env} from "../utils/env";
import {Box, Typography, useMediaQuery} from "@material-ui/core";
import {EntriesTableCategory} from "../components/Table/EntriesTableCategory";
import {columnType, notificationType, organismType} from "../utils/ressources/types";
import {useTranslation} from "react-i18next";
import {GridRenderCellParams} from "@mui/x-data-grid";
import {Button, DebounceInput} from "epfl-elements-react-si-extra";
import {Redirect, useHistory, useLocation} from "react-router-dom";
import "../../css/styles.scss";
import Notifications from "../components/Table/Notifications";
import {handleClickFileLink} from "../utils/ressources/file";
import {AddNewOrganismDialog} from "../components/organism/AddNewOrganismDialog";
import {deleteOrganism} from "../utils/graphql/PostingTools";
import {AlertDialog} from "../components/global/AlertDialog";
import {getErrorMessage} from "../utils/graphql/Utils";
import {getFormattedDate} from "../utils/ressources/parser";

interface OrganismsControlProps {
	handleCurrentPage: (page: string) => void;
	user: any;
}

export const OrganismsControl = ({
	handleCurrentPage,
	user
}: OrganismsControlProps) => {
	const history = useHistory();
	const { t } = useTranslation();
	const oidc = useOpenIDConnectContext();
	const [openDialog, setOpenDialog] = useState<boolean>(false);
	const [tableData, setTableData] = useState<organismType[]>([]);
	const [selectedOrganism, setSelectedOrganism] = useState<organismType>();
	const [loading, setLoading] = useState(false);
	const [search, setSearch] = React.useState('');
	const [notificationType, setNotificationType] = useState<notificationType>({
		type: "info",
		text: '',
	});
	const isMediumDevice = useMediaQuery("only screen and (min-width : 769px) and (max-width : 992px)");
	const isLargeDevice = useMediaQuery("only screen and (min-width : 993px) and (max-width : 1200px)");
	const isExtraLargeDevice = useMediaQuery("only screen and (min-width : 1201px)");
	const [openNotification, setOpenNotification] = useState<boolean>(false);
	const [loadingDelete, setLoadingDelete] = useState(false);
	const [openDialogDelete, setOpenDialogDelete] = useState<boolean>(false);
	const [deleted, setDeleted] = useState(false);
	const PAGE_SIZE = 100;
	const [page, setPage] = useState<number>(0);
	const [totalCount, setTotalCount] = useState<number>(0);

	const columnsLarge: columnType[] = [
		{field: "organism", headerName: t('organism.name'), width: 200,
			renderCell: (params: GridRenderCellParams<any, organismType>) => (
				params.row.organism
			)},
		{field: "risk_group", headerName: t('organism.risk'), width: 80,
			renderCell: (params: GridRenderCellParams<any, organismType>) => (
				params.row.risk_group
			)},
		{field: "filePath", headerName: t('organism.file'), width: 200, disableExport: true,
			renderCell: (params: GridRenderCellParams<any, organismType>) => (
				params.row.filePath && params.row.filePath != 'NA' ? <a href={params.row.filePath}
																 onClick={async e => await handleClickFileLink(e, oidc.accessToken, params.row.id, 'organism')}>{params.row.filePath.split('/').pop()}</a> :
					<></>
			)
		},
		{field: "updated_on", headerName: t('organism.updated_on'), width: 100,
			renderCell: (params: GridRenderCellParams<any, organismType>) => {
				const date = new Date(params.row.updated_on);
				return getFormattedDate(date);
			},
			valueFormatter: (params: GridRenderCellParams<any, organismType>) => {
				if (!params.value) return "";
				const date = new Date(params.value);
				return getFormattedDate(date);
			}
		},
		{field: "updated_by", headerName: t('organism.updated_by'), width: 200,
			renderCell: (params: GridRenderCellParams<any, organismType>) => (
				params.row.updated_by
			)},
		{field: "id", headerName: t('organism.actions'), width: 100, disableExport: true,
			renderCell: (params: GridRenderCellParams<any, organismType>) => (
				user.canEditOrganisms ? <><Button size="icon"
								iconName={"#edit-3"}
								onClick={() => modifyOrganism(params.row)}/>
					<Button size="icon"
									style={{marginLeft: '10px'}}
									iconName={`#trash`}
									onClick={() => handleDelete(params.row)}/></> : <></>
			)
		},
	];

	const columnsMedium: columnType[] = [
		{field: "organism", headerName: t('organism.name'), width: 150,
			renderCell: (params: GridRenderCellParams<any, organismType>) => {
				return <div style={{lineHeight: '20px', fontSize: "smaller", display: "flex", flexDirection: 'column'}}>
					<span>
						<b>{params.row.organism}</b><br/>{` (${t('organism.risk')} : ${params.row.risk_group})`}
					</span>
				</div>
			},
			valueGetter: (params: GridRenderCellParams<any, organismType>) => params.row.organism
		},
		{field: "filePath", headerName: t('organism.file'), width: 150, disableExport: true,
			renderCell: (params: GridRenderCellParams<any, organismType>) => (
				params.row.filePath && params.row.filePath != 'NA' ? <a href={params.row.filePath}
																																onClick={async e => await handleClickFileLink(e, oidc.accessToken, params.row.id, 'organism')}>{params.row.filePath.split('/').pop()}</a> :
					<></>
			)
		},
		{field: "updated_by", headerName: t('organism.updated'), width: 150,
			renderCell: (params: GridRenderCellParams<any, organismType>) => {
				const date = new Date(params.row.updated_on);
				return <div style={{lineHeight: '20px', fontSize: "smaller", display: "flex", flexDirection: 'column'}}>
					{params.row.updated_by}
					<br/>
					{'(' + getFormattedDate(date) + ')'}
				</div>
			}
		},
		{field: "id", headerName: t('organism.actions'), width: 100, disableExport: true,
			renderCell: (params: GridRenderCellParams<any, organismType>) => (
				user.canEditOrganisms ? <><Button size="icon"
									iconName={"#edit-3"}
									onClick={() => modifyOrganism(params.row)}/>
					<Button size="icon"
									style={{marginLeft: '10px'}}
									iconName={`#trash`}
									onClick={() => handleDelete(params.row)}/></> : <></>
			)
		},
	];

	const columnsSmall: columnType[] = [
		{field: "organism", headerName: t('organism.name'), width: 300,
			renderCell: (params: GridRenderCellParams<any, organismType>) => {
				const date = new Date(params.row.updated_on);
				return <div style={{lineHeight: '20px', fontSize: "smaller", display: "flex", flexDirection: 'column'}}>
					<span>
						<b>{params.row.organism}</b>{` (${t('organism.risk')} : ${params.row.risk_group})`}
					</span>
					{params.row.filePath && params.row.filePath != 'NA' ?
					<a href={params.row.filePath} onClick={async e => await handleClickFileLink(e, oidc.accessToken, params.row.id, 'organism')}>{params.row.filePath.split('/').pop()}</a> :
					<></>}
					<div style={{display: "flex", flexDirection: 'row'}}>
						<span style={{fontStyle: 'italic', fontSize: 'xx-small'}}>
							{params.row.updated_by + '(' + getFormattedDate(date) + ')'}
						</span>
					</div>
				</div>
			}
		}
	];

	const location = useLocation();

	useEffect(() => {
		if (user.canListOrganisms) {
			loadFetch();
			setDeleted(false);
		}
	}, [search, deleted, user, page]);

	useEffect(() => {
		const urlParams = new URLSearchParams(location.search);
		if ( urlParams.has('search') ) {
			setSearch(decodeURIComponent(urlParams.get('search') as string));
		} else {
			setSearch('');
		}
		handleCurrentPage("organisms");
		setPage(0);
	}, [oidc.accessToken, location]);

	const loadFetch = async () => {
		setLoading(true);
		const results = await fetchOrganismsFromFullText(
			env().REACT_APP_GRAPHQL_ENDPOINT_URL,
			oidc.accessToken,
			search,
			PAGE_SIZE,
			PAGE_SIZE * page,
		);
		if (results.status === 200 && results.data){
			setTableData(results.data.bios);
			setTotalCount(results.data.totalCount);
		} else {
			const errors = getErrorMessage(results, 'organismsFromFullText');
			setNotificationType(errors.notif);
			setOpenNotification(true);
		}
		setLoading(false);
	};

	function onChangeInput(newValue: string) {
		const val = newValue ?? '';
		setSearch(val);
		setPage(0);
		history.push(`/organismscontrol?search=${encodeURIComponent(val)}`);
	}

	const handleClose = () => {
		setOpenNotification(false);
	};

	const modifyOrganism = (dataOrganism: organismType) => {
		setOpenDialog(true);
		setSelectedOrganism(dataOrganism);
	}

	const handleDelete = async (dataOrganism: organismType | undefined) => {
		if (!dataOrganism) return;
		setLoadingDelete(true);
		setSelectedOrganism(dataOrganism);
		const results = await fetchHazards(
			env().REACT_APP_GRAPHQL_ENDPOINT_URL,
			oidc.accessToken,
			20,
			0,
			'Biological',
			'organism=' + dataOrganism?.organism
		);

		if ( results.status && results.status === 200 && results.data && results.data.totalCount > 0) {
			setOpenDialogDelete(true);
		} else {
			deleteOrg(dataOrganism);
		}
		setLoadingDelete(false);
	};

	function deleteOrg(dataOrganism: organismType) {
		deleteOrganism(
			env().REACT_APP_GRAPHQL_ENDPOINT_URL,
			oidc.accessToken,
			JSON.stringify(dataOrganism?.id),
		).then(res => {
			const errors = getErrorMessage(res, 'deleteOrganism');
			if(errors.errorCount == 0) {
				setOpenDialogDelete(false);
				setDeleted(true);
				setSelectedOrganism(undefined);
				setSearch('');
			} else {
				setNotificationType(errors.notif);
				setOpenNotification(true);
			}
		});
	}

	return (
		<Box>
			<Typography gutterBottom>
				{t(`organism.organismsList`)}
			</Typography>
			<div className="utilsBar">
				<DebounceInput
					input={search}
					id={search + "'_id"}
					key={search + "'_id"}
					onChange={onChangeInput}
					placeholder={t(`organism.search`)}
					className="debounce-input"
				/>
				{user.canEditOrganisms && <Button
					onClick={() => {
						setOpenDialog(true);
						setSelectedOrganism(undefined);
					}}
					label={t(`generic.addNew`)}
					iconName={`#plus-circle`}
					primary/>}
			</div>
			<EntriesTableCategory
				tableData={tableData}
				columns={(isExtraLargeDevice || isLargeDevice) ? columnsLarge : (isMediumDevice ? columnsMedium : columnsSmall)}
				loading={loading}
				pageToOpen={"organism"}
				loadServerRows={setPage}
				page={page}
				totalCount={totalCount}
				pageSize={PAGE_SIZE}
			/>
			<AddNewOrganismDialog openDialog={openDialog}
														close={() => {
															setOpenDialog(false);
															setSearch('');
														}}
														save={(searchVal: string) => {
															setOpenDialog(false);
															onChangeInput(searchVal);
														}}
														selectedOrganism={selectedOrganism}/>
			<Notifications
				open={openNotification}
				notification={notificationType}
				close={handleClose}
			/>
			<AlertDialog openDialog={openDialogDelete}
									 onCancelClick={() => setOpenDialogDelete(false)}
									 onOkClick={() => handleDelete(selectedOrganism)}
									 cancelLabel={t('generic.cancelButton')}
									 okLabel={t('organism.retry')}
									 title={t('organism.deleteOrganismTitle') + selectedOrganism?.organism}>
				{t('organism.deleteOrganismMessageStart')}
				<a href={'/hazardscontrol?Category=Biological&organism='+selectedOrganism?.organism} target="_blank">{t('organism.link')}</a>
				{t('organism.deleteOrganismMessageEnd')}
			</AlertDialog>
			{deleted && <Redirect to="/organismscontrol"/>}
		</Box>
	);
}
