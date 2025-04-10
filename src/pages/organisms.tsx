import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import React, {useEffect, useState} from "react";
import {fetchOrganismsFromFullText} from "../utils/graphql/FetchingTools";
import {env} from "../utils/env";
import {Box, Typography, useMediaQuery} from "@material-ui/core";
import {EntriesTableCategory} from "../components/Table/EntriesTableCategory";
import {columnType, notificationType, organismType} from "../utils/ressources/types";
import {useTranslation} from "react-i18next";
import featherIcons from "epfl-elements/dist/icons/feather-sprite.svg";
import {GridRenderCellParams} from "@mui/x-data-grid";
import {DebounceInput} from "epfl-elements-react/src/stories/molecules/inputFields/DebounceInput.tsx";
import {useHistory} from "react-router-dom";
import "../../css/styles.scss";
import {Button} from "epfl-elements-react/src/stories/molecules/Button.tsx";
import {notificationsVariants} from "../utils/ressources/variants";
import Notifications from "../components/Table/Notifications";
import {handleClickFileLink} from "../utils/ressources/file";
import {AddNewOrganismDialog} from "../components/organism/AddNewOrganismDialog";

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
	];

	const columnsMedium: columnType[] = [
		{field: "organism", headerName: t('organism.updated'), width: 300,
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
		}
	];

	const columnsSmall: columnType[] = [
		{field: "organism", headerName: t('organism.updated'), width: 300,
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

	useEffect(() => {
		loadFetch();
	}, [search]);

	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		if ( urlParams.has('search') ) {
			setSearch(decodeURIComponent(urlParams.get('search') as string));
		}
		handleCurrentPage("organisms");
	}, [oidc.accessToken]);

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
					onClick={() => setOpenDialog(true)}
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
			<AddNewOrganismDialog openDialog={openDialog} close={() => setOpenDialog(false)}
												save={(searchVal: string) => {
													setOpenDialog(false);
													onChangeInput(searchVal);
												}}/>
			<Notifications
				open={openNotification}
				notification={notificationType}
				close={handleClose}
			/>
		</Box>
	);
}
