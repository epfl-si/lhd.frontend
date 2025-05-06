import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import React, {useEffect, useState} from "react";
import {fetchHazards, fetchOrganismsFromFullText} from "../utils/graphql/FetchingTools";
import {env} from "../utils/env";
import {Box, Typography, useMediaQuery} from "@material-ui/core";
import {EntriesTableCategory} from "../components/Table/EntriesTableCategory";
import {columnType, notificationType, organismType} from "../utils/ressources/types";
import {useTranslation} from "react-i18next";
import featherIcons from "epfl-elements/dist/icons/feather-sprite.svg";
import {GridRenderCellParams} from "@mui/x-data-grid";
import {DebounceInput} from "epfl-elements-react/src/stories/molecules/inputFields/DebounceInput.tsx";
import {Redirect, useHistory, useLocation} from "react-router-dom";
import "../../css/styles.scss";
import {Button} from "epfl-elements-react/src/stories/molecules/Button.tsx";
import {notificationsVariants} from "../utils/ressources/variants";
import Notifications from "../components/Table/Notifications";
import {handleClickFileLink} from "../utils/ressources/file";
import {AddNewOrganismDialog} from "../components/organism/AddNewOrganismDialog";
import {deleteOrganism} from "../utils/graphql/PostingTools";
import {AlertDialog} from "../components/global/AlertDialog";

interface OrganismsControlProps {
	handleCurrentPage: (page: string) => void;
	isUserAuthorized: boolean;
}

export const OrganismsControl = ({
	handleCurrentPage,
	isUserAuthorized
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

	const columnsLarge: columnType[] = [
		{field: "organism", headerName: t('organism.name'), width: 300},
		{field: "risk_group", headerName: t('organism.risk'), width: 100},
		{field: "filePath", headerName: t('organism.file'), width: 300, disableExport: true,
			renderCell: (params: GridRenderCellParams<any, organismType>) => (
				params.row.filePath && params.row.filePath != 'NA' ? <a href={params.row.filePath}
																 onClick={e => handleClickFileLink(e, oidc.accessToken, params.row.filePath)}>{params.row.filePath.split('/').pop()}</a> :
					<></>
			)
		},
		{field: "updated_on", headerName: t('organism.updated_on'), width: 300,
			renderCell: (params: GridRenderCellParams<any, organismType>) => {
				const date = new Date(params.row.updated_on);
				return date.toLocaleDateString("en-GB");
			},
			valueFormatter: (params: GridRenderCellParams<any, organismType>) => {
				if (!params.value) return "";
				const date = new Date(params.value);
				return date.toLocaleDateString("en-GB");
			}
		},
		{field: "updated_by", headerName: t('organism.updated_by'), width: 300},
		{field: "id", headerName: t('organism.actions'), width: 300, disableExport: true,
			renderCell: (params: GridRenderCellParams<any, organismType>) => (
				<><Button size="icon"
								iconName={"#edit-3"}
								onClick={() => modifyOrganism(params.row)}/>
					<Button size="icon"
									style={{marginLeft: '10px'}}
									iconName={`#trash`}
									onClick={() => handleDelete(params.row)}/></>
			)
		},
	];

	const columnsMedium: columnType[] = [
		{field: "organism", headerName: t('organism.name'), width: 300,
			renderCell: (params: GridRenderCellParams<any, organismType>) => {
				const date = new Date(params.row.updated_on);
				return <div style={{lineHeight: '20px', fontSize: "smaller", display: "flex", flexDirection: 'column'}}>
					<span>
						<b>{params.row.organism}</b>{` (${t('organism.risk')} : ${params.row.risk_group})`}
					</span>
				</div>
			}
		},
		{field: "filePath", headerName: t('organism.file'), width: 300, disableExport: true,
			renderCell: (params: GridRenderCellParams<any, organismType>) => (
				params.row.filePath && params.row.filePath != 'NA' ? <a href={params.row.filePath}
																																onClick={e => handleClickFileLink(e, oidc.accessToken, params.row.filePath)}>{params.row.filePath.split('/').pop()}</a> :
					<></>
			)
		},
		{field: "updated_by", headerName: t('organism.updated'), width: 300,
			renderCell: (params: GridRenderCellParams<any, organismType>) => {
				const date = new Date(params.row.updated_on);
				return <div style={{display: "flex", flexDirection: 'row'}}>
					{params.row.updated_by + '(' + date.toLocaleDateString("en-GB") + ')'}
				</div>
			}
		},
		{field: "id", headerName: t('organism.actions'), width: 300, disableExport: true,
			renderCell: (params: GridRenderCellParams<any, organismType>) => (
				<><Button size="icon"
									iconName={"#edit-3"}
									onClick={() => modifyOrganism(params.row)}/>
					<Button size="icon"
									style={{marginLeft: '10px'}}
									iconName={`#trash`}
									onClick={() => handleDelete(params.row)}/></>
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
					<a href={params.row.filePath} onClick={e => handleClickFileLink(e, oidc.accessToken, params.row.filePath)}>{params.row.filePath.split('/').pop()}</a> :
					<></>}
					<div style={{display: "flex", flexDirection: 'row'}}>
						<span style={{fontStyle: 'italic', fontSize: 'xx-small'}}>
							{params.row.updated_by + '(' + date.toLocaleDateString("en-GB") + ')'}
						</span>
					</div>
				</div>
			}
		}
	];

	const location = useLocation();

	useEffect(() => {
		loadFetch();
		setDeleted(false);
	}, [search, deleted]);

	useEffect(() => {
		const urlParams = new URLSearchParams(location.search);
		if ( urlParams.has('search') ) {
			setSearch(decodeURIComponent(urlParams.get('search') as string));
		} else {
			setSearch('');
		}
		handleCurrentPage("organisms");
	}, [oidc.accessToken, location]);

	const loadFetch = async () => {
		setLoading(true);
		const results = await fetchOrganismsFromFullText(
			env().REACT_APP_GRAPHQL_ENDPOINT_URL,
			oidc.accessToken,
			search
		);
		if (results.status === 200 && results.data){
			setTableData(results.data);
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
			if(res.status == 200 && !res.data?.deleteOrganism?.errors) {
				setOpenDialogDelete(false);
				setDeleted(true);
				setSelectedOrganism(undefined);
				setSearch('');
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
				{isUserAuthorized && <Button
					onClick={() => {
						setOpenDialog(true);
						setSelectedOrganism(undefined);
					}}
					label={t(`generic.addNew`)}
					iconName={`${featherIcons}#plus-circle`}
					primary/>}
			</div>
			<EntriesTableCategory
				tableData={tableData}
				columns={(isExtraLargeDevice || isLargeDevice) ? columnsLarge : (isMediumDevice ? columnsMedium : columnsSmall)}
				loading={loading}
				pageToOpen={"organism"}
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
