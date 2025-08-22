import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import React, {useEffect, useState} from "react";
import {fetchChemicalAuthorizations} from "../utils/graphql/FetchingTools";
import {env} from "../utils/env";
import {Box, Typography, useMediaQuery} from "@material-ui/core";
import {EntriesTableCategory} from "../components/Table/EntriesTableCategory";
import {authorizationType, columnType, notificationType} from "../utils/ressources/types";
import {useTranslation} from "react-i18next";
import {GridRenderCellParams} from "@mui/x-data-grid";
import {useHistory} from "react-router-dom";
import "../../css/styles.scss";
import {notificationsVariants} from "../utils/ressources/variants";
import {MultipleAutocomplete} from "../components/global/MultipleAutocomplete";

interface ChemicalsAuthorizationControlProps {
	handleCurrentPage: (page: string) => void;
	isUserAuthorized: boolean;
}

export const ChemicalsAuthorizationControl = ({
	handleCurrentPage,
	isUserAuthorized
}: ChemicalsAuthorizationControlProps) => {
	const history = useHistory();
	const { t } = useTranslation();
	const oidc = useOpenIDConnectContext();
	const [openDialog, setOpenDialog] = useState<boolean>(false);
	const [tableData, setTableData] = useState<authorizationType[]>([]);
	const [selected, setSelected] = useState<authorizationType>();
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
	const PAGE_SIZE = 100;
	const [page, setPage] = useState<number>(0);
	const [totalCount, setTotalCount] = useState<number>(0);

	const columnsLarge: columnType[] = [
		{field: "unit", headerName: t('authorization.unit'), flex: 0.1,
			renderCell: (params: GridRenderCellParams<any, authorizationType>) => {
				return <>{params.row.unit ? params.row.unit.name : ''}</>
			}},
		{field: "authorization", headerName: t('authorization.authorization'), flex: 0.2,
			renderCell: (params: GridRenderCellParams<any, authorizationType>) => {
				return <>{params.row.authorization}</>
			}},
		{field: "renewals", headerName: t('authorization.renewals'), flex: 0.1,
			renderCell: (params: GridRenderCellParams<any, authorizationType>) => {
				return <>{params.row.renewals}</>
			}},
		{field: "creation_date", headerName: t('authorization.created'), flex: 0.1,
			renderCell: (params: GridRenderCellParams<any, authorizationType>) => {
				const date = new Date(params.row.creation_date);
				return date.toLocaleDateString("en-GB");
			},},
		{field: "expiration_date", headerName: t('authorization.expires'), flex: 0.1,
			renderCell: (params: GridRenderCellParams<any, authorizationType>) => {
				const date = new Date(params.row.expiration_date);
				return date.toLocaleDateString("en-GB");
			},},
		{field: "status", headerName: t('authorization.status'), flex: 0.1,
			renderCell: (params: GridRenderCellParams<any, authorizationType>) => {
				return <>{params.row.status}</>
			}},
		{field: "authorization_rooms", headerName: t('authorization.room'), flex: 0.1,
			renderCell: (params: GridRenderCellParams<any, authorizationType>) => (
					<div className="form-card-div">
						{params.row.authorization_rooms.map(item => {
								return (
									<span>• <a href={`/roomdetails?room=${encodeURIComponent(item.name)}`} target="_blank">{item.name}</a><br/></span>
								)
							}
						)}
					</div>
			),
		},
		{field: "authorization_holders", headerName: t('authorization.holders'), flex: 0.2,
			renderCell: (params: GridRenderCellParams<any, authorizationType>) => (
				<div className="form-card-div">
					{params.row.authorization_holders.map(item => {
							return (
								<span>• {item.name} {item.surname} ({item.sciper})<br/></span>
							)
						}
					)}
				</div>
			),
		},
		{field: "authorization_chemicals", headerName: t('authorization.cas'), flex: 0.2,
			renderCell: (params: GridRenderCellParams<any, authorizationType>) => (
				<div className="form-card-div">
					{params.row.authorization_chemicals.map(item => {
							return (
								<span>• {item.auth_chem_en} ({item.cas_auth_chem}) - <b style={{fontSize: "smaller"}}>{item.flag_auth_chem ? t('chemical.active') : t('chemical.archived')}</b><br/></span>
							)
						}
					)}
				</div>
			),
		}
	];

	const columnsMedium: columnType[] = [
		{field: "authorization", headerName: t('authorization.authorization'), flex: 0.2,
			renderCell: (params: GridRenderCellParams<any, authorizationType>) => {
				return <div style={{display: "flex", flexDirection: "column", fontSize: "smaller"}}>
					<span>{params.row.unit ? params.row.unit.name : ''}</span>
					<span>{params.row.authorization}-{params.row.renewals}</span>
					<b style={{fontSize: "smaller"}}>{params.row.status}</b>
				</div>
			}},
		{field: "creation_date", headerName: t('authorization.created'), flex: 0.1,
			renderCell: (params: GridRenderCellParams<any, authorizationType>) => {
				const date = new Date(params.row.creation_date);
				const dateExp = new Date(params.row.expiration_date);
				return <div style={{display: "flex", flexDirection: "column", fontSize: "smaller"}}>
					<span><b>{t('generic.from')}</b> {date.toLocaleDateString("en-GB")}</span>
					<span><b>{t('generic.to')}</b> {dateExp.toLocaleDateString("en-GB")}</span>
				</div>
			}},
		{field: "authorization_rooms", headerName: t('authorization.room'), flex: 0.1,
			renderCell: (params: GridRenderCellParams<any, authorizationType>) => (
				<div style={{display: "flex", flexDirection: "column", fontSize: "smaller"}}>
					{params.row.authorization_rooms.map(item => {
							return (
								<span>• <a href={`/roomdetails?room=${encodeURIComponent(item.name)}`} target="_blank">{item.name}</a><br/></span>
							)
						}
					)}
				</div>
			),
		},
		{field: "authorization_holders", headerName: t('authorization.holders'), flex: 0.2,
			renderCell: (params: GridRenderCellParams<any, authorizationType>) => (
				<div style={{display: "flex", flexDirection: "column", fontSize: "smaller"}}>
					{params.row.authorization_holders.map(item => {
							return (
								<span>• {item.name} {item.surname} ({item.sciper})<br/></span>
							)
						}
					)}
				</div>
			),
		},
		{field: "authorization_chemicals", headerName: t('authorization.cas'), flex: 0.2,
			renderCell: (params: GridRenderCellParams<any, authorizationType>) => (
				<div style={{display: "flex", flexDirection: "column", fontSize: "smaller"}}>
					{params.row.authorization_chemicals.map(item => {
							return (
								<span>• {item.auth_chem_en} ({item.cas_auth_chem}) - <b>{item.flag_auth_chem ? t('chemical.active') : t('chemical.archived')}</b><br/></span>
							)
						}
					)}
				</div>
			),
		}
	];

	const columnsSmall: columnType[] = [
		{field: "authorization", headerName: t('authorization.authorization'), flex: 0.2,
		renderCell: (params: GridRenderCellParams<any, authorizationType>) => {
			const date = new Date(params.row.creation_date);
			const dateExp = new Date(params.row.expiration_date);
			const rooms = params.row.authorization_rooms.map(item => {
					return (
						<span>• <a href={`/roomdetails?room=${encodeURIComponent(item.name)}`} target="_blank">{item.name}</a><br/></span>
					)
				}
			);
			const holders = params.row.authorization_holders.map(item => {
					return (
						<span>• {item.name} {item.surname} ({item.sciper})<br/></span>
					)
				}
			);
			const cas = params.row.authorization_chemicals.map(item => {
					return (
						<span>• {item.auth_chem_en} ({item.cas_auth_chem}) - <b>{item.flag_auth_chem ? t('chemical.active') : t('chemical.archived')}</b><br/></span>
					)
				}
			);
			return <div style={{display: "flex", flexDirection: "column", fontSize: "smaller"}}>
				<span>{params.row.unit ? params.row.unit.name : ''}</span>
				<span>{params.row.authorization}-{params.row.renewals}</span>
				<b style={{fontSize: "smaller"}}>{params.row.status}</b>
				<span><b>{t('generic.from')}</b> {date.toLocaleDateString("en-GB")}</span>
				<span><b>{t('generic.to')}</b> {dateExp.toLocaleDateString("en-GB")}</span>
				{rooms}
				{holders}
				{cas}
			</div>
		}}
	];

	useEffect(() => {
		if (isUserAuthorized) {
			loadFetch();
		}
	}, [search, page, isUserAuthorized]);

	useEffect(() => {
		handleCurrentPage("chemicalauthorizationscontrol");
		setPage(0);
	}, [oidc.accessToken]);

	const loadFetch = async () => {
		setLoading(true);
		const results = await fetchChemicalAuthorizations(
			env().REACT_APP_GRAPHQL_ENDPOINT_URL,
			oidc.accessToken,
			PAGE_SIZE,
			PAGE_SIZE * page,
			search,
			'Chemical'
		);
		if (results.status === 200 && results.data){
			setTableData(results.data.authorizations);
			setTotalCount(results.data.totalCount);
		} else {
			console.error('Bad GraphQL results', results);
			setNotificationType(notificationsVariants['bad_graphql_query']);
			setOpenNotification(true);
		}
		setLoading(false);
	};

	return (
		<Box>
			{isUserAuthorized ? <>
			<Typography gutterBottom>
				{t(`chemical.chemicalAuthorizationList`)}
			</Typography>
			<div className="utilsBar">
				<MultipleAutocomplete
					setPage={setPage}
					setSearch={setSearch}
					parent="chemicalauthorizationscontrol"
				/>
			</div>
			<EntriesTableCategory
				tableData={tableData}
				columns={(isExtraLargeDevice || isLargeDevice) ? columnsLarge : (isMediumDevice ? columnsMedium : columnsSmall)}
				loading={loading}
				pageToOpen={"chemicalauthorizations"}
				loadServerRows={setPage}
				page={page}
				totalCount={totalCount}
				pageSize={PAGE_SIZE}
			/>
			</> : <b>You are not authorized for this page</b>}
		</Box>
	);
}
