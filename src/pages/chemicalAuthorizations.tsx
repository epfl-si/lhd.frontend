import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import React, {useEffect, useState} from "react";
import {fetchChemicalAuthorizations} from "../utils/graphql/FetchingTools";
import {env} from "../utils/env";
import {Box, Typography, useMediaQuery} from "@material-ui/core";
import {EntriesTableCategory} from "../components/Table/EntriesTableCategory";
import {authorizationType, columnType, notificationType, UserInfo} from "../utils/ressources/types";
import {useTranslation} from "react-i18next";
import {GridRenderCellParams} from "@mui/x-data-grid";
import "../../css/styles.scss";
import {MultipleAutocomplete} from "../components/global/MultipleAutocomplete";
import {getErrorMessage} from "../utils/graphql/Utils";
import {getFormattedDate} from "../utils/ressources/parser";
import {Button} from "epfl-elements-react-si-extra";
import {exportToExcel, getExportFileName} from "../utils/ressources/file";
import {getQueryStringArray} from "../utils/web/URLUtils";

interface ChemicalsAuthorizationControlProps {
	handleCurrentPage: (page: string) => void;
	user: UserInfo;
}

export const ChemicalsAuthorizationControl = ({
	handleCurrentPage,
	user
}: ChemicalsAuthorizationControlProps) => {
	const { t } = useTranslation();
	const oidc = useOpenIDConnectContext();
	const [tableData, setTableData] = useState<authorizationType[]>([]);
	const [loading, setLoading] = useState(false);
	const queryArray = getQueryStringArray();
	const [search, setSearch] = React.useState<string>(queryArray.map(qs => qs.title).join('&'));
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
				return <a href={`https://go.epfl.ch/${(params.row.authorization).split("-")[1]}`} target="_blank">{params.row.authorization}</a>
			}},
		{field: "renewals", headerName: t('authorization.renewals'), flex: 0.1,
			renderCell: (params: GridRenderCellParams<any, authorizationType>) => {
				return <>{params.row.renewals}</>
			}},
		{field: "creationDate", headerName: t('authorization.createdDate'), flex: 0.1,
			renderCell: (params: GridRenderCellParams<any, authorizationType>) => {
				const date = new Date(params.row.creationDate);
				return getFormattedDate(date);
			},},
		{field: "expirationDate", headerName: t('authorization.expires'), flex: 0.1,
			renderCell: (params: GridRenderCellParams<any, authorizationType>) => {
				const date = new Date(params.row.expirationDate);
				return getFormattedDate(date);
			},},
		{field: "status", headerName: t('authorization.status'), flex: 0.1,
			renderCell: (params: GridRenderCellParams<any, authorizationType>) => {
				return <>{params.row.status}</>
			}},
		{field: "authorizationRooms", headerName: t('authorization.room'), flex: 0.1,
			renderCell: (params: GridRenderCellParams<any, authorizationType>) => (
					<div className="form-card-div">
						{params.row.authorizationRooms.map(item => {
								return (
									item.isDeleted ? <span style={{color: "red", textDecoration: "line-through"}}>• {item.name}<br/></span> : <span>• <a href={`/roomdetails?room=${encodeURIComponent(item.name)}`} target="_blank">{item.name}</a><br/></span>
								)
							}
						)}
					</div>
			),
		},
		{field: "authorizationHolders", headerName: t('authorization.holders'), flex: 0.2,
			renderCell: (params: GridRenderCellParams<any, authorizationType>) => (
				<div className="form-card-div">
					{params.row.authorizationHolders.map(item => {
							return (
								<span>• {item.name} {item.surname} ({item.sciper})<br/></span>
							)
						}
					)}
				</div>
			),
		},
		{field: "authorizationChemicals", headerName: t('authorization.cas'), flex: 0.2,
			renderCell: (params: GridRenderCellParams<any, authorizationType>) => (
				<div className="form-card-div">
					{params.row.authorizationChemicals.map(item => {
							return (
								<span>• {item.authChemEn} ({item.casAuthChem}) - <b style={{fontSize: "smaller"}}>{item.flagAuthChem ? t('chemical.active') : t('chemical.archived')}</b><br/></span>
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
					<span><a href={`https://go.epfl.ch/${(params.row.authorization).split("-")[1]}`} target="_blank">{params.row.authorization}-{params.row.renewals}</a></span>
					<b style={{fontSize: "smaller"}}>{params.row.status}</b>
				</div>
			}},
		{field: "creationDate", headerName: t('authorization.createdDate'), flex: 0.1,
			renderCell: (params: GridRenderCellParams<any, authorizationType>) => {
				const date = new Date(params.row.creationDate);
				const dateExp = new Date(params.row.expirationDate);
				return <div style={{display: "flex", flexDirection: "column", fontSize: "smaller"}}>
					<span><b>{t('generic.from')}</b> {getFormattedDate(date)}</span>
					<span><b>{t('generic.to')}</b> {getFormattedDate(dateExp)}</span>
				</div>
			}},
		{field: "authorizationRooms", headerName: t('authorization.room'), flex: 0.1,
			renderCell: (params: GridRenderCellParams<any, authorizationType>) => (
				<div style={{display: "flex", flexDirection: "column", fontSize: "smaller"}}>
					{params.row.authorizationRooms.map(item => {
							return (
								item.isDeleted ? <span style={{color: "red", textDecoration: "line-through"}}>• {item.name}<br/></span> : <span>• <a href={`/roomdetails?room=${encodeURIComponent(item.name)}`} target="_blank">{item.name}</a><br/></span>
							)
						}
					)}
				</div>
			),
		},
		{field: "authorizationHolders", headerName: t('authorization.holders'), flex: 0.2,
			renderCell: (params: GridRenderCellParams<any, authorizationType>) => (
				<div style={{display: "flex", flexDirection: "column", fontSize: "smaller"}}>
					{params.row.authorizationHolders.map(item => {
							return (
								<span>• {item.name} {item.surname} ({item.sciper})<br/></span>
							)
						}
					)}
				</div>
			),
		},
		{field: "authorizationChemicals", headerName: t('authorization.cas'), flex: 0.2,
			renderCell: (params: GridRenderCellParams<any, authorizationType>) => (
				<div style={{display: "flex", flexDirection: "column", fontSize: "smaller"}}>
					{params.row.authorizationChemicals.map(item => {
							return (
								<span>• {item.authChemEn} ({item.casAuthChem}) - <b>{item.flagAuthChem ? t('chemical.active') : t('chemical.archived')}</b><br/></span>
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
			const date = new Date(params.row.creationDate);
			const dateExp = new Date(params.row.expirationDate);
			const rooms = params.row.authorizationRooms.map(item => {
					return (
						item.isDeleted ? <span style={{color: "red", textDecoration: "line-through"}}>• {item.name}<br/></span> : <span>• <a href={`/roomdetails?room=${encodeURIComponent(item.name)}`} target="_blank">{item.name}</a><br/></span>
					)
				}
			);
			const holders = params.row.authorizationHolders.map(item => {
					return (
						<span>• {item.name} {item.surname} ({item.sciper})<br/></span>
					)
				}
			);
			const cas = params.row.authorizationChemicals.map(item => {
					return (
						<span>• {item.authChemEn} ({item.casAuthChem}) - <b>{item.flagAuthChem ? t('chemical.active') : t('chemical.archived')}</b><br/></span>
					)
				}
			);
			return <div style={{display: "flex", flexDirection: "column", fontSize: "smaller"}}>
				<span>{params.row.unit ? params.row.unit.name : ''}</span>
				<span><a href={`https://go.epfl.ch/${(params.row.authorization).split("-")[1]}`} target="_blank">{params.row.authorization}-{params.row.renewals}</a></span>
				<b style={{fontSize: "smaller"}}>{params.row.status}</b>
				<span><b>{t('generic.from')}</b> {getFormattedDate(date)}</span>
				<span><b>{t('generic.to')}</b> {getFormattedDate(dateExp)}</span>
				{rooms}
				{holders}
				{cas}
			</div>
		}}
	];

	useEffect(() => {
		if (user.canListChemicals) {
			loadFetch();
		}
	}, [search, page, user.canListChemicals]);

	useEffect(() => {
		handleCurrentPage("chemicalauthorizationscontrol");
	}, [oidc.accessToken]);

	const loadFetch = async () => {
		setLoading(true);
		const results = await fetchChemicalAuthorizations(
			env().REACT_APP_GRAPHQL_BACKEND_ENDPOINT_URL,
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
			const errors = getErrorMessage(results, 'authorizationsWithPagination');
			setNotificationType(errors.notif);
			setOpenNotification(true);
		}
		setLoading(false);
	};

	async function onExport () {
		setLoading(true);
		const results = await fetchChemicalAuthorizations(
			env().REACT_APP_GRAPHQL_BACKEND_ENDPOINT_URL,
			oidc.accessToken,
			0, 0,
			search,
			'Chemical'
		);
		if (results.status === 200 && results.data){
			exportToExcel(flattenAuthorizations(results.data.authorizations), getExportFileName('Chemical'));
		} else {
			const errors = getErrorMessage(results, 'authorizationsWithPagination');
			setNotificationType(errors.notif);
			setOpenNotification(true);
		}
		setLoading(false);
	}

	const ensureArray = (arr: any) => (arr && arr.length ? arr : [null]);
	function flattenAuthorizations(data: any[]) {
		return data.flatMap(auth => {
				const rooms = ensureArray(auth.authorizationRooms);
				const holders = ensureArray(auth.authorizationHolders);
				const chemicals = ensureArray(auth.authorizationChemicals);
				return {
					authorization: auth.authorization,
					creationDate: getFormattedDate(new Date(auth.creationDate), "."),
					expirationDate: getFormattedDate(new Date(auth.expirationDate), "."),
					renewals: auth.renewals,
					unitName: auth.unit?.name,
					status: auth.status,

					room: rooms.map((r: any) => r ? `${r.name}${r.isDeleted ? ' (Deleted)' : ''}` : '').join('\n'),
					holder: holders.map((h: any) => h ? `${h.name} ${h.surname} (${h.sciper})` : '').join('\n'),
					cas: chemicals.map((c: any) => c ? `${c.casAuthChem} - ${c.authChemEn} (${c.flagAuthChem ? t('chemical.active') : t('chemical.archived')})` : '').join('\n')
				}
			}
		);
	}

	return (
		<Box>
			{user.canListChemicals ? <>
			<Typography gutterBottom>
				{t(`chemical.chemicalAuthorizationList`)}
			</Typography>
			<div className="utilsBar">
				<MultipleAutocomplete
					setPage={setPage}
					setSearch={setSearch}
					parent="chemicalauthorizationscontrol"
					queryArray={queryArray}
				/>
				<Button
					isDisabled={tableData.length == 0}
					style={{minWidth: '10%', padding: '10px', marginLeft: '10px'}}
					onClick={() => onExport()}
					label={t(`generic.export`)}
					iconName={`#download`}
					primary/>
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
