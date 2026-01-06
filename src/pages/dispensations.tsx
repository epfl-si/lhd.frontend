import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import React, {useEffect, useState} from "react";
import {env} from "../utils/env";
import {Box, Typography, useMediaQuery} from "@material-ui/core";
import {EntriesTableCategory} from "../components/Table/EntriesTableCategory";
import {columnType, dispensationType, notificationType} from "../utils/ressources/types";
import {useTranslation} from "react-i18next";
import {GridRenderCellParams} from "@mui/x-data-grid";
import {Redirect, useHistory} from "react-router-dom";
import "../../css/styles.scss";
import {MultipleAutocomplete} from "../components/global/MultipleAutocomplete";
import Notifications from "../components/Table/Notifications";
import {Button} from "epfl-elements-react-si-extra";
import {getErrorMessage} from "../utils/graphql/Utils";
import {fetchDispensations} from "../utils/graphql/FetchingTools";
import {AddNewDispensationDialog} from "../components/dispensation/AddNewDispensationDialog";

interface DispensationControlProps {
	handleCurrentPage: (page: string) => void;
	user: any;
}

export const DispensationControl = ({
	handleCurrentPage,
	user
}: DispensationControlProps) => {
	const history = useHistory();
	const { t } = useTranslation();
	const oidc = useOpenIDConnectContext();
	const [openDialog, setOpenDialog] = useState<boolean>(false);
	const [tableData, setTableData] = useState<dispensationType[]>([]);
	const [selected, setSelected] = useState<dispensationType>();
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
		{field: "dispensation", headerName: t('dispensation.dispensation'), flex: 0.2,
			renderCell: (params: GridRenderCellParams<any, dispensationType>) => {
				return <>{params.row.dispensation}</>
			}},
		{field: "subject", headerName: t('dispensation.subject'), flex: 0.1,
			renderCell: (params: GridRenderCellParams<any, dispensationType>) => {
				return <>{params.row.other_subject ? `${params.row.subject} (${params.row.other_subject})` : params.row.subject}</>
			}},
		{field: "renewals", headerName: t('dispensation.renewals'), flex: 0.1,
			renderCell: (params: GridRenderCellParams<any, dispensationType>) => {
				return <>{params.row.renewals}</>
			}},
		{field: "date_start", headerName: t('dispensation.date_start'), flex: 0.1,
			renderCell: (params: GridRenderCellParams<any, dispensationType>) => {
				const date = new Date(params.row.date_start);
				return date.toLocaleDateString("en-GB");
			},},
		{field: "date_end", headerName: t('dispensation.date_end'), flex: 0.1,
			renderCell: (params: GridRenderCellParams<any, dispensationType>) => {
				const date = new Date(params.row.date_end);
				return date.toLocaleDateString("en-GB");
			},},
		{field: "status", headerName: t('dispensation.status'), flex: 0.1,
			renderCell: (params: GridRenderCellParams<any, dispensationType>) => {
				return <>{params.row.status}</>
			}},
		{field: "dispensation_rooms", headerName: t('dispensation.room'), flex: 0.1,
			renderCell: (params: GridRenderCellParams<any, dispensationType>) => (
					<div className="form-card-div">
						{params.row.dispensation_rooms.map(item => {
								return (
									item.isDeleted ? <span style={{color: "red", textDecoration: "line-through"}}>• {item.name}<br/></span> : <span>• <a href={`/roomdetails?room=${encodeURIComponent(item.name)}`} target="_blank">{item.name}</a><br/></span>
								)
							}
						)}
					</div>
			),
		},
		{field: "dispensation_holders", headerName: t('dispensation.holders'), flex: 0.2,
			renderCell: (params: GridRenderCellParams<any, dispensationType>) => (
				<div className="form-card-div">
					{params.row.dispensation_holders.map(item => {
							return (
								<span>• {item.name} {item.surname} ({item.sciper})<br/></span>
							)
						}
					)}
				</div>
			),
		},
		{field: "dispensation_tickets", headerName: t('dispensation.tickets'), flex: 0.2,
			renderCell: (params: GridRenderCellParams<any, dispensationType>) => (
				<div className="form-card-div">
					{params.row.dispensation_tickets.map(item => {
							return (
								<span>• <a href={`https://go.epfl.ch/${item.ticket_number}`} target="_blank">{item.ticket_number}</a><br/></span>
							)
						}
					)}
				</div>
			),
		},
		{field: "id", headerName: t('organism.actions'), flex: 0.2,
			renderCell: (params: GridRenderCellParams<any, dispensationType>) => (
				user.canEditDispensations ? <>
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
		{field: "dispensation", headerName: t('dispensation.dispensation'), flex: 0.2,
			renderCell: (params: GridRenderCellParams<any, dispensationType>) => {
				return <div style={{display: "flex", flexDirection: "column", fontSize: "smaller"}}>
					<span>{params.row.dispensation}-{params.row.renewals}</span>
					<b style={{fontSize: "smaller"}}>{params.row.status}</b>
				</div>
			}},
		{field: "creation_date", headerName: t('dispensation.created'), flex: 0.1,
			renderCell: (params: GridRenderCellParams<any, dispensationType>) => {
				const date = new Date(params.row.date_start);
				const dateExp = new Date(params.row.date_end);
				return <div style={{display: "flex", flexDirection: "column", fontSize: "smaller"}}>
					<span><b>{t('generic.from')}</b> {date.toLocaleDateString("en-GB")}</span>
					<span><b>{t('generic.to')}</b> {dateExp.toLocaleDateString("en-GB")}</span>
				</div>
			}},
		{field: "dispensation_rooms", headerName: t('dispensation.room'), flex: 0.1,
			renderCell: (params: GridRenderCellParams<any, dispensationType>) => (
				<div style={{display: "flex", flexDirection: "column", fontSize: "smaller"}}>
					{params.row.dispensation_rooms.map(item => {
							return (
								item.isDeleted ? <span style={{color: "red", textDecoration: "line-through"}}>• {item.name}<br/></span> : <span>• <a href={`/roomdetails?room=${encodeURIComponent(item.name)}`} target="_blank">{item.name}</a><br/></span>
							)
						}
					)}
				</div>
			),
		},
		{field: "dispensation_holders", headerName: t('dispensation.holders'), flex: 0.2,
			renderCell: (params: GridRenderCellParams<any, dispensationType>) => (
				<div style={{display: "flex", flexDirection: "column", fontSize: "smaller"}}>
					{params.row.dispensation_holders.map(item => {
							return (
								<span>• {item.name} {item.surname} ({item.sciper})<br/></span>
							)
						}
					)}
				</div>
			),
		},
		{field: "dispensation_tickets", headerName: t('dispensation.ticket'), flex: 0.2,
			renderCell: (params: GridRenderCellParams<any, dispensationType>) => (
				<div style={{display: "flex", flexDirection: "column", fontSize: "smaller"}}>
					{params.row.dispensation_tickets.map(item => {
							return (
								<span>• <a href={`https://go.epfl.ch/${item.ticket_number}`} target="_blank">{item.ticket_number}</a><br/></span>
							)
						}
					)}
				</div>
			),
		}
	];

	const columnsSmall: columnType[] = [
		{field: "dispensation", headerName: t('dispensation.dispensation'), flex: 0.2,
		renderCell: (params: GridRenderCellParams<any, dispensationType>) => {
			const date = new Date(params.row.date_start);
			const dateExp = new Date(params.row.date_end);
			const rooms = params.row.dispensation_rooms.map(item => {
					return (
						item.isDeleted ? <span style={{color: "red", textDecoration: "line-through"}}>• {item.name}<br/></span> : <span>• <a href={`/roomdetails?room=${encodeURIComponent(item.name)}`} target="_blank">{item.name}</a><br/></span>
					)
				}
			);
			const holders = params.row.dispensation_holders.map(item => {
					return (
						<span>• {item.name} {item.surname} ({item.sciper})<br/></span>
					)
				}
			);
			const tickets = params.row.dispensation_tickets.map(item => {
					return (
						<span>• <a href={`https://go.epfl.ch/${item.ticket_number}`} target="_blank">{item.ticket_number}</a><br/></span>
					)
				}
			);
			return <div style={{display: "flex", flexDirection: "column", fontSize: "smaller"}}>
				<span>{params.row.dispensation}-{params.row.renewals}</span>
				<b style={{fontSize: "smaller"}}>{params.row.status}</b>
				<span><b>{t('generic.from')}</b> {date.toLocaleDateString("en-GB")}</span>
				<span><b>{t('generic.to')}</b> {dateExp.toLocaleDateString("en-GB")}</span>
				{rooms}
				{holders}
				{tickets}
			</div>
		}}
	];

	useEffect(() => {
		if (user.canListDispensations) {
			loadFetch();
			setDeleted(false);
			setSelected(undefined);
		}
	}, [search, page, user, deleted]);

	useEffect(() => {
		handleCurrentPage("dispensationscontrol");
		setPage(0);
	}, [oidc.accessToken]);

	const loadFetch = async () => {
		setLoading(true);
		const results = await fetchDispensations(
			env().REACT_APP_GRAPHQL_ENDPOINT_URL,
			oidc.accessToken,
			PAGE_SIZE,
			PAGE_SIZE * page,
			search
		);
		if (results.status === 200 && results.data){
			setTableData(results.data.dispensations);
			setTotalCount(results.data.totalCount);
		} else {
			const errors = getErrorMessage(results, 'dispensationsWithPagination');
			setNotificationType(errors.notif);
			setOpenNotification(true);
		}
		setLoading(false);
	};

	function onChangeInput(newValue: string) {
		const val = newValue ?? '';
		setSearch(val);
		if (val === '') {
			loadFetch();
		} else {
			history.push(`/dispensationscontrol?Dispensation=${encodeURIComponent(val)}`);
		}
	}

	const handleClose = () => {
		setOpenNotification(false);
	};

	const modify = (data: dispensationType) => {
		setOpenDialog(true);
		setSelected(data);
	}

	return (
		<Box>
			{user.canListDispensations ? <>
			<Typography gutterBottom>
				{t(`menu.dispensations`)}
			</Typography>
			<div className="utilsBar">
				<MultipleAutocomplete
					setPage={setPage}
					setSearch={setSearch}
					parent="dispensationscontrol"
				/>
				{user.canEditDispensations && <Button
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
				pageToOpen={"dispensation"}
				loadServerRows={setPage}
				page={page}
				totalCount={totalCount}
				pageSize={PAGE_SIZE}
			/>
				{user.canEditDispensations && <><AddNewDispensationDialog openDialog={openDialog}
																			close={() => {
																				setOpenDialog(false);
																				setSearch('');
																			}}
																			save={(searchVal: string) => {
																				setOpenDialog(false);
																				onChangeInput(searchVal);
																			}}
																			selectedDispensation={selected}/>
					{/*<DeleteDispensationDialog disp={selected}
				openDialog={openDialogDelete}
				setOpenDialog={setOpenDialogDelete}
				setDeleted={setDeleted}
			/>*/}</>}
				<Notifications
					open={openNotification}
					notification={notificationType}
					close={handleClose}
				/>
				{deleted && <Redirect to="/dispensationscontrol"/>}
			</> : <b>You are not authorized for this page</b>}
		</Box>
	);
}
