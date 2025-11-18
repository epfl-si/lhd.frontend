import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import React, {useEffect, useState} from "react";
import {env} from "../utils/env";
import {Box, Typography, useMediaQuery} from "@material-ui/core";
import {EntriesTableCategory} from "../components/Table/EntriesTableCategory";
import {authorizationType, columnType, notificationType} from "../utils/ressources/types";
import {useTranslation} from "react-i18next";
import {GridRenderCellParams} from "@mui/x-data-grid";
import {Redirect, useHistory} from "react-router-dom";
import "../../css/styles.scss";
import {MultipleAutocomplete} from "../components/global/MultipleAutocomplete";
import {fetchRadioprotectionAuthorizations} from "../utils/graphql/FetchingTools";
import Notifications from "../components/Table/Notifications";
import {AddNewRadioprotectionDialog} from "../components/radioprotection/AddNewRadioprotectionDialog";
import {Button} from "epfl-elements-react-si-extra";
import {DeleteRadioprotectionDialog} from "../components/radioprotection/DeleteRadioprotectionDialog";
import {getErrorMessage} from "../utils/graphql/Utils";

interface RadioprotectionsAuthorizationControlProps {
	handleCurrentPage: (page: string) => void;
	user: any;
}

export const RadioprotectionsAuthorizationControl = ({
	handleCurrentPage,
	user
}: RadioprotectionsAuthorizationControlProps) => {
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
	const [deleted, setDeleted] = useState(false);
	const [openDialogDelete, setOpenDialogDelete] = useState<boolean>(false);

	const columnsLarge: columnType[] = [
		{field: "unit", headerName: t('authorization.unit'), flex: 0.1,
			renderCell: (params: GridRenderCellParams<any, authorizationType>) => {
				return <>{params.row.unit ? params.row.unit.name : ''}</>
			}},
		{field: "authority", headerName: t('authorization.authority'), flex: 0.1,
			renderCell: (params: GridRenderCellParams<any, authorizationType>) => {
				return <>{params.row.authority}</>
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
									item.isDeleted ? <span style={{color: "red"}}>• {item.name}<br/></span> : <span>• <a href={`/roomdetails?room=${encodeURIComponent(item.name)}`} target="_blank">{item.name}</a><br/></span>
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
		{field: "authorization_radiations", headerName: t('authorization.source'), flex: 0.2,
			renderCell: (params: GridRenderCellParams<any, authorizationType>) => (
				<div className="form-card-div">
					{params.row.authorization_radiations.map(item => {
							return (
								<span>• {item.source}<br/></span>
							)
						}
					)}
				</div>
			),
		},
		{field: "id", headerName: t('organism.actions'), flex: 0.2,
			renderCell: (params: GridRenderCellParams<any, authorizationType>) => (
				user.canEditAuthorizations ? <>
					<Button size="icon"
								iconName={"#edit-3"}
								onClick={() => modify(params.row)}/>
					<Button size="icon"
								style={{marginLeft: '10px'}}
								iconName={`#trash`}
								onClick={() => {
									setOpenDialogDelete(true);
									setSelected(params.row);
								}}/>
				</> : <></>
			)
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
								item.isDeleted ? <span style={{color: "red"}}>• {item.name}<br/></span> : <span>• <a href={`/roomdetails?room=${encodeURIComponent(item.name)}`} target="_blank">{item.name}</a><br/></span>
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
		{field: "authorization_radiations", headerName: t('authorization.cas'), flex: 0.2,
			renderCell: (params: GridRenderCellParams<any, authorizationType>) => (
				<div style={{display: "flex", flexDirection: "column", fontSize: "smaller"}}>
					{params.row.authorization_radiations.map(item => {
							return (
								<span>• {item.source}<br/></span>
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
						item.isDeleted ? <span style={{color: "red"}}>• {item.name}<br/></span> : <span>• <a href={`/roomdetails?room=${encodeURIComponent(item.name)}`} target="_blank">{item.name}</a><br/></span>
					)
				}
			);
			const holders = params.row.authorization_holders.map(item => {
					return (
						<span>• {item.name} {item.surname} ({item.sciper})<br/></span>
					)
				}
			);
			const radiations = params.row.authorization_radiations.map(item => {
					return (
						<span>• {item.source}<br/></span>
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
				{radiations}
			</div>
		}}
	];

	useEffect(() => {
		if (user.canListAuthorizations) {
			loadFetch();
			setDeleted(false);
			setSelected(undefined);
		}
	}, [search, page, user, deleted]);

	useEffect(() => {
		handleCurrentPage("radioprotectionauthorizationscontrol");
		setPage(0);
	}, [oidc.accessToken]);

	const loadFetch = async () => {
		setLoading(true);
		const results = await fetchRadioprotectionAuthorizations(
			env().REACT_APP_GRAPHQL_ENDPOINT_URL,
			oidc.accessToken,
			PAGE_SIZE,
			PAGE_SIZE * page,
			search,
			'IonisingRadiation'
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

	function onChangeInput(newValue: string) {
		const val = newValue ?? '';
		setSearch(val);
		history.push(`/radioprotectionauthorizationscontrol?Authorization=${encodeURIComponent(val)}`);
	}

	const handleClose = () => {
		setOpenNotification(false);
	};

	const modify = (data: authorizationType) => {
		setOpenDialog(true);
		setSelected(data);
	}

	return (
		<Box>
			{user.canListAuthorizations ? <>
			<Typography gutterBottom>
				{t(`menu.radioprotection`)}
			</Typography>
			<div className="utilsBar">
				<MultipleAutocomplete
					setPage={setPage}
					setSearch={setSearch}
					parent="radioprotectionauthorizationscontrol"
				/>
				{user.canEditAuthorizations && <Button
					onClick={() => {
						setOpenDialog(true);
						setSelected(undefined);
					}}
					label={t(`generic.addNew`)}
					iconName={`#plus-circle`}
					primary/>}
			</div>
			<EntriesTableCategory
				tableData={tableData}
				columns={(isExtraLargeDevice || isLargeDevice) ? columnsLarge : (isMediumDevice ? columnsMedium : columnsSmall)}
				loading={loading}
				pageToOpen={"radioprotectionauthorization"}
				loadServerRows={setPage}
				page={page}
				totalCount={totalCount}
				pageSize={PAGE_SIZE}
			/>
				{user.canEditAuthorizations && <><AddNewRadioprotectionDialog openDialog={openDialog}
																			close={() => {
																				setOpenDialog(false);
																				setSearch('');
																			}}
																			save={(searchVal: string) => {
																				setOpenDialog(false);
																				onChangeInput(searchVal);
																			}}
																			selectedRadioprotection={selected}/>
					<DeleteRadioprotectionDialog auth={selected}
				openDialog={openDialogDelete}
				setOpenDialog={setOpenDialogDelete}
				setDeleted={setDeleted}
			/></>}
				<Notifications
					open={openNotification}
					notification={notificationType}
					close={handleClose}
				/>
				{deleted && <Redirect to="/radioprotectionauthorizationscontrol"/>}
			</> : <b>You are not authorized for this page</b>}
		</Box>
	);
}
