import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import React, {useEffect, useState} from "react";
import {fetchChemicals} from "../utils/graphql/FetchingTools";
import {env} from "../utils/env";
import {Box, Typography, useMediaQuery} from "@material-ui/core";
import {EntriesTableCategory} from "../components/Table/EntriesTableCategory";
import {chemicalsType, columnType, notificationType} from "../utils/ressources/types";
import {useTranslation} from "react-i18next";
import {GridRenderCellParams} from "@mui/x-data-grid";
import {Redirect, useHistory} from "react-router-dom";
import "../../css/styles.scss";
import {Button} from "epfl-elements-react-si-extra";
import {notificationsVariants} from "../utils/ressources/variants";
import Notifications from "../components/Table/Notifications";
import {MultipleAutocomplete} from "../components/global/MultipleAutocomplete";
import {AddNewChemicalDialog} from "../components/chemical/AddNewChemicalDialog";
import {deleteChemical} from "../utils/graphql/PostingTools";

interface ChemicalsControlProps {
	handleCurrentPage: (page: string) => void;
	user: any;
}

export const ChemicalsControl = ({
	handleCurrentPage,
	user
}: ChemicalsControlProps) => {
	const history = useHistory();
	const { t } = useTranslation();
	const oidc = useOpenIDConnectContext();
	const [openDialog, setOpenDialog] = useState<boolean>(false);
	const [tableData, setTableData] = useState<chemicalsType[]>([]);
	const [selectedChemical, setSelectedChemical] = useState<chemicalsType>();
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
	const [deleted, setDeleted] = useState(false);
	const PAGE_SIZE = 100;
	const [page, setPage] = useState<number>(0);
	const [totalCount, setTotalCount] = useState<number>(0);

	const columnsLarge: columnType[] = [
		{field: "cas_auth_chem", headerName: t('chemical.CASNumber'), width: 200,
			renderCell: (params: GridRenderCellParams<any, chemicalsType>) => (
				params.row.cas_auth_chem
			)},
		{field: "auth_chem_en", headerName: t('chemical.name'), width: 300,
			renderCell: (params: GridRenderCellParams<any, chemicalsType>) => (
				params.row.auth_chem_en
			)},
		{field: "flag_auth_chem", headerName: t('chemical.status'), width: 80,
			renderCell: (params: GridRenderCellParams<any, chemicalsType>) => {
				return <>{params.row.flag_auth_chem ? t('chemical.active') : t('chemical.archived')}</>
			}},
		/*{field: "fastway", headerName: t('chemical.fastway'), width: 300,
			renderCell: (params: GridRenderCellParams<any, chemicalsType>) => (
				params.row.fastway
			)},
		{field: "auth_code", headerName: t('chemical.auth_code'), width: 300,
			renderCell: (params: GridRenderCellParams<any, chemicalsType>) => (
				params.row.auth_code
			)},*/
		// {field: "log", headerName: t('organism.log'), width: 100,
		// 	renderCell: (params: GridRenderCellParams<any, chemicalsType>) => {
		// 		const date = new Date(params.row.updated_on);
		// 		return date.toLocaleDateString("en-GB");
		// 	},
		// 	valueFormatter: (params: GridRenderCellParams<any, chemicalsType>) => {
		// 		if (!params.value) return "";
		// 		const date = new Date(params.value);
		// 		return date.toLocaleDateString("en-GB");
		// 	}
		// },
		{field: "id", headerName: t('chemical.actions'), width: 100,
			renderCell: (params: GridRenderCellParams<any, chemicalsType>) => (
				user.canEditChemicals ? <><Button size="icon"
								iconName={"#edit-3"}
								onClick={() => modify(params.row)}/>
					<Button size="icon"
									style={{marginLeft: '10px'}}
									iconName={`#trash`}
									onClick={() => handleDelete(params.row)}/></> : <></>
			)
		},
	];

	const columnsMedium: columnType[] = [
		{field: "cas_auth_chem", headerName: t('chemical.CASNumber'), width: 150,
			renderCell: (params: GridRenderCellParams<any, chemicalsType>) => {
				return <div style={{lineHeight: '20px', fontSize: "smaller", display: "flex", flexDirection: 'column'}}>
					<span>
						<b>{params.row.cas_auth_chem}</b><br/>{params.row.auth_chem_en}
						<br/><b>{params.row.fastway}</b><br/>{params.row.auth_code}
					</span>
				</div>
			},
		},
		{field: "flag_auth_chem", headerName: t('chemical.status'), width: 80,
			renderCell: (params: GridRenderCellParams<any, chemicalsType>) => {
				return <>{params.row.flag_auth_chem ? t('chemical.active') : t('chemical.archived')}</>
			}},
		{field: "id", headerName: t('chemical.actions'), width: 100,
			renderCell: (params: GridRenderCellParams<any, chemicalsType>) => (
				user.canEditChemicals ? <><Button size="icon"
									iconName={"#edit-3"}
									onClick={() => modify(params.row)}/>
					<Button size="icon"
									style={{marginLeft: '10px'}}
									iconName={`#trash`}
									onClick={() => handleDelete(params.row)}/></> : <></>
			)
		},
	];

	const columnsSmall: columnType[] = [
		{field: "cas_auth_chem", headerName: t('chemical.CASNumber'), width: 300,
			renderCell: (params: GridRenderCellParams<any, chemicalsType>) => {
				return <div style={{lineHeight: '20px', fontSize: "smaller", display: "flex", flexDirection: 'column'}}>
						<b>{params.row.cas_auth_chem} (<span style={{fontStyle: 'italic', fontSize: 'xx-small'}}>
							{params.row.flag_auth_chem ? t('chemical.active') : t('chemical.archived')}
						</span>)</b>{params.row.auth_chem_en}
				</div>
			}
		}
	];

	useEffect(() => {
		if (user.canListChemicals) {
			loadFetch();
		}
		setDeleted(false);
	}, [search, deleted, page, user]);

	useEffect(() => {
		handleCurrentPage("chemicalscontrol");
		setPage(0);
	}, [oidc.accessToken]);

	const loadFetch = async () => {
		setLoading(true);
		const results = await fetchChemicals(
			env().REACT_APP_GRAPHQL_ENDPOINT_URL,
			oidc.accessToken,
			PAGE_SIZE,
			PAGE_SIZE * page,
			search
		);
		if (results.status === 200 && results.data){
			setTableData(results.data.chemicals);
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
		setSearch(`CAS=${encodeURIComponent(val)}`);
		history.push(`/chemicalscontrol?CAS=${encodeURIComponent(val)}`);
	}

	const handleClose = () => {
		setOpenNotification(false);
	};

	const modify = (data: chemicalsType) => {
		setOpenDialog(true);
		setSelectedChemical(data);
	}

	const handleDelete = async (data: chemicalsType | undefined) => {
		if (!data) return;
		setSelectedChemical(data);
		deleteChem(data);
	};

	function deleteChem(data: chemicalsType) {
		deleteChemical(
			env().REACT_APP_GRAPHQL_ENDPOINT_URL,
			oidc.accessToken,
			JSON.stringify(data?.id),
		).then(res => {
			if(res.status == 200 && !res.data?.deleteChemical?.errors) {
				setDeleted(true);
				setSelectedChemical(undefined);
				setSearch('');
			} else {
				setNotificationType(notificationsVariants['chemical-deletion-error']);
				setOpenNotification(true);
			}
		});
	}

	return (
		<Box>
			{user.canListChemicals ? <>
			<Typography gutterBottom>
				{t(`chemical.chemicalList`)}
			</Typography>
			<div className="utilsBar">
				<MultipleAutocomplete
					setPage={setPage}
					setSearch={setSearch}
					parent="chemicalscontrol"
				/>
				{user.canEditChemicals && <Button
					onClick={() => {
						setOpenDialog(true);
						setSelectedChemical(undefined);
					}}
					label={t(`generic.addNew`)}
					iconName={`#plus-circle`}
					primary/>}
			</div>
			<EntriesTableCategory
				tableData={tableData}
				columns={(isExtraLargeDevice || isLargeDevice) ? columnsLarge : (isMediumDevice ? columnsMedium : columnsSmall)}
				loading={loading}
				pageToOpen={"chemicals"}
				loadServerRows={setPage}
				page={page}
				totalCount={totalCount}
				pageSize={PAGE_SIZE}
			/>
			{<AddNewChemicalDialog openDialog={openDialog}
														close={() => {
															setOpenDialog(false);
															setSearch('');
														}}
														save={(searchVal: string) => {
															setOpenDialog(false);
															onChangeInput(searchVal);
														}}
														selectedChemical={selectedChemical}/>}
			<Notifications
				open={openNotification}
				notification={notificationType}
				close={handleClose}
			/>
			{deleted && <Redirect to="/chemicalscontrol"/>}
			</> : <b>You are not authorized for this page</b>}
		</Box>
	);
}
