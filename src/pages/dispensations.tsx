import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import React, {useEffect, useState} from "react";
import {env} from "../utils/env";
import {Box, Typography, useMediaQuery} from "@material-ui/core";
import {EntriesTableCategory} from "../components/Table/EntriesTableCategory";
import {columnType, dispensationType, notificationType, UserInfo} from "../utils/ressources/types";
import {useTranslation} from "react-i18next";
import {GridRenderCellParams} from "@mui/x-data-grid";
import {Redirect} from "react-router-dom";
import "../../css/styles.scss";
import {MultipleAutocomplete} from "../components/global/MultipleAutocomplete";
import Notifications from "../components/Table/Notifications";
import {Button} from "epfl-elements-react-si-extra";
import {getErrorMessage} from "../utils/graphql/Utils";
import {fetchDispensations} from "../utils/graphql/FetchingTools";
import {AddNewDispensationDialog} from "../components/dispensation/AddNewDispensationDialog";
import {DeleteDispensationDialog} from "../components/dispensation/DeleteDispensationDialog";
import {exportToExcel, getExportFileName} from "../utils/ressources/file";
import {formatDate, getFormattedDate} from "../utils/ressources/parser";
import {getQueryStringArray} from "../utils/web/URLUtils";

interface DispensationControlProps {
	handleCurrentPage: (page: string) => void;
	user: UserInfo;
}

export const DispensationControl = ({
	handleCurrentPage,
	user
}: DispensationControlProps) => {
	const { t } = useTranslation();
	const oidc = useOpenIDConnectContext();
	const [openDialog, setOpenDialog] = useState<boolean>(false);
	const [tableData, setTableData] = useState<dispensationType[]>([]);
	const [selected, setSelected] = useState<dispensationType>();
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
	const [deleted, setDeleted] = useState(false);
	const [openDialogDelete, setOpenDialogDelete] = useState<boolean>(false);

	const columnsLarge: columnType[] = [
		{field: "dispensation", headerName: t('dispensation.dispensation'), flex: 0.2,
			renderCell: (params: GridRenderCellParams<any, dispensationType>) => {
				return <>{params.row.dispensation}</>
			}},
		{field: "subject", headerName: t('dispensation.subject'), flex: 0.1,
			renderCell: (params: GridRenderCellParams<any, dispensationType>) => {
				return <>{params.row.subjectOther ? `${params.row.subject} (${params.row.subjectOther})` : params.row.subject}</>
			}},
		{field: "renewals", headerName: t('dispensation.renewals'), flex: 0.1,
			renderCell: (params: GridRenderCellParams<any, dispensationType>) => {
				return <>{params.row.renewals}</>
			}},
		{field: "dateStart", headerName: t('dispensation.date_start'), flex: 0.1,
			renderCell: (params: GridRenderCellParams<any, dispensationType>) => {
				const date = new Date(params.row.dateStart);
				return getFormattedDate(date);
			},},
		{field: "dateEnd", headerName: t('dispensation.date_end'), flex: 0.1,
			renderCell: (params: GridRenderCellParams<any, dispensationType>) => {
				const date = new Date(params.row.dateEnd);
				return getFormattedDate(date);
			},},
		{field: "status", headerName: t('dispensation.status'), flex: 0.1,
			renderCell: (params: GridRenderCellParams<any, dispensationType>) => {
				return <>{params.row.status}</>
			}},
		{field: "dispensationRooms", headerName: t('dispensation.room'), flex: 0.1,
			renderCell: (params: GridRenderCellParams<any, dispensationType>) => (
					<div className="form-card-div">
						{params.row.dispensationRooms.map(item => {
								return (
									item.isDeleted ? <span style={{color: "red", textDecoration: "line-through"}}>• {item.name}<br/></span> : <span>• <a href={`/roomdetails?room=${encodeURIComponent(item.name)}`} target="_blank">{item.name}</a><br/></span>
								)
							}
						)}
					</div>
			),
		},
		{field: "dispensationUnits", headerName: t('dispensation.unit'), flex: 0.1,
			renderCell: (params: GridRenderCellParams<any, dispensationType>) => (
				<div className="form-card-div">
					{params.row.dispensationUnits.map(item => {
							return <span>• <a href={`/unitdetails?unit=${encodeURIComponent(item.name)}`} target="_blank">{item.name}</a><br/></span>
						}
					)}
				</div>
			),
		},
		{field: "dispensationHolders", headerName: t('dispensation.holders'), flex: 0.2,
			renderCell: (params: GridRenderCellParams<any, dispensationType>) => (
				<div className="form-card-div">
					{params.row.dispensationHolders.map(item => {
							return (
								<span>• {item.name} {item.surname} ({item.sciper})<br/></span>
							)
						}
					)}
				</div>
			),
		},
		{field: "dispensationTickets", headerName: t('dispensation.tickets'), flex: 0.2,
			renderCell: (params: GridRenderCellParams<any, dispensationType>) => (
				<div className="form-card-div">
					{params.row.dispensationTickets.map(item => {
							return (
								<span>• <a href={`https://go.epfl.ch/${item.ticketNumber}`} target="_blank">{item.ticketNumber}</a><br/></span>
							)
						}
					)}
				</div>
			),
		},
		{field: "opLock", headerName: t('organism.actions'), flex: 0.2,
			renderCell: (params: GridRenderCellParams<any, dispensationType>) => (
				user.canEditDispensations ? <>
					<Button size="icon"
								style={{marginLeft: '10px', visibility: params.row.status === 'Draft' ? 'visible' : 'hidden'}}
								iconName={`#trash`}
								onClick={(event) => {
									event.stopPropagation();
									handleDelete(params.row);
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
					<b style={{fontSize: "smaller"}}>{params.row.subjectOther ? `${params.row.subject} (${params.row.subjectOther})` : params.row.subject}</b>
				</div>
			}},
		{field: "creation_date", headerName: t('dispensation.created'), flex: 0.1,
			renderCell: (params: GridRenderCellParams<any, dispensationType>) => {
				const date = new Date(params.row.dateStart);
				const dateExp = new Date(params.row.dateEnd);
				return <div style={{display: "flex", flexDirection: "column", fontSize: "smaller"}}>
					<span><b>{t('generic.from')}</b> {getFormattedDate(date)}</span>
					<span><b>{t('generic.to')}</b> {getFormattedDate(dateExp)}</span>
				</div>
			}},
		{field: "dispensationRooms", headerName: t('dispensation.room'), flex: 0.1,
			renderCell: (params: GridRenderCellParams<any, dispensationType>) => (
				<div style={{display: "flex", flexDirection: "column", fontSize: "smaller"}}>
					{params.row.dispensationRooms.map(item => {
							return (
								item.isDeleted ? <span style={{color: "red", textDecoration: "line-through"}}>• {item.name}<br/></span> : <span>• <a href={`/roomdetails?room=${encodeURIComponent(item.name)}`} target="_blank">{item.name}</a><br/></span>
							)
						}
					)}
				</div>
			),
		},
		{field: "dispensationUnits", headerName: t('dispensation.unit'), flex: 0.1,
			renderCell: (params: GridRenderCellParams<any, dispensationType>) => (
				<div className="form-card-div">
					{params.row.dispensationUnits.map(item => {
							return <span>• <a href={`/unitdetails?unit=${encodeURIComponent(item.name)}`} target="_blank">{item.name}</a><br/></span>
						}
					)}
				</div>
			),
		},
		{field: "dispensationHolders", headerName: t('dispensation.holders'), flex: 0.2,
			renderCell: (params: GridRenderCellParams<any, dispensationType>) => (
				<div style={{display: "flex", flexDirection: "column", fontSize: "smaller"}}>
					{params.row.dispensationHolders.map(item => {
							return (
								<span>• {item.name} {item.surname} ({item.sciper})<br/></span>
							)
						}
					)}
				</div>
			),
		},
		{field: "dispensationTickets", headerName: t('dispensation.tickets'), flex: 0.2,
			renderCell: (params: GridRenderCellParams<any, dispensationType>) => (
				<div style={{display: "flex", flexDirection: "column", fontSize: "smaller"}}>
					{params.row.dispensationTickets.map(item => {
							return (
								<span>• <a href={`https://go.epfl.ch/${item.ticketNumber}`} target="_blank">{item.ticketNumber}</a><br/></span>
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
			const date = new Date(params.row.dateStart);
			const dateExp = new Date(params.row.dateEnd);
			const rooms = params.row.dispensationRooms.map(item => {
					return (
						item.isDeleted ? <span style={{color: "red", textDecoration: "line-through"}}>• {item.name}<br/></span> : <span>• <a href={`/roomdetails?room=${encodeURIComponent(item.name)}`} target="_blank">{item.name}</a><br/></span>
					)
				}
			);
			const holders = params.row.dispensationHolders.map(item => {
					return (
						<span>• {item.name} {item.surname} ({item.sciper})<br/></span>
					)
				}
			);
			const units= params.row.dispensationUnits.map(item => {
				return <span>• <a href={`/unitdetails?unit=${encodeURIComponent(item.name)}`} target="_blank">{item.name}</a><br/></span>
			});
			const tickets = params.row.dispensationTickets.map(item => {
					return (
						<span>• <a href={`https://go.epfl.ch/${item.ticketNumber}`} target="_blank">{item.ticketNumber}</a><br/></span>
					)
				}
			);
			return <div style={{display: "flex", flexDirection: "column", fontSize: "smaller"}}>
				<span>{params.row.dispensation}-{params.row.renewals}</span>
				<b style={{fontSize: "smaller"}}>{params.row.status}</b>
				<span><b>{t('generic.from')}</b> {getFormattedDate(date)}</span>
				<span><b>{t('generic.to')}</b> {getFormattedDate(dateExp)}</span>
				{rooms}
				{units}
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
	}, [search, page, user.canListDispensations, deleted]);

	useEffect(() => {
		handleCurrentPage("dispensationscontrol");
	}, [oidc.accessToken]);

	const loadFetch = async () => {
		setLoading(true);
		const results = await fetchDispensations(
			env().REACT_APP_GRAPHQL_BACKEND_ENDPOINT_URL,
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

	const handleClose = () => {
		setOpenNotification(false);
	};

	const handleDelete = (data: dispensationType) => {
		setOpenDialogDelete(true);
		setSelected(data);
	}

	const modify = (data: dispensationType) => {
		setOpenDialog(true);
		setSelected(data);
	}

	const onExport = async () => {
		setLoading(true);
		const results = await fetchDispensations(
			env().REACT_APP_GRAPHQL_BACKEND_ENDPOINT_URL,
			oidc.accessToken,
			0, 0,
			search
		);

		if ( results.status === 200 && results.data ) {
			const fileName = search.split('&')
				.map(part => part.split('=')[1])
				.join('_');
			const parsedResults = results.data.dispensations.map(disp => {
				return {
					dispensation: disp.dispensation,
					dateStart: formatDate(new Date(disp.dateStart), true),
					dateEnd: formatDate(new Date(disp.dateEnd), true),
					renewals: disp.renewals,
					subject: disp.subject,
					subjectOther: disp.subjectOther ?? '',
					description: disp.description,
					comment: disp.comment ?? '',
					createdBy: disp.createdBy,
					createdOn: formatDate(new Date(disp.createdOn), true),
					modifiedBy: disp.modifiedBy,
					modifiedOn: formatDate(new Date(disp.modifiedOn), true),
					rooms: disp.dispensationRooms.map(room => room.name),
					units: disp.dispensationUnits.map(unit => unit.name),
					holders: disp.dispensationHolders.map(holder => `${holder.name} ${holder.surname} (${holder.sciper})`),
					status: disp.status,
					tickets: disp.dispensationTickets.map(ticket => ticket.ticketNumber)
				}
			});
			exportToExcel(parsedResults, getExportFileName(search !== '' ? `dispensations_${fileName}` : 'dispensations'));
		} else {
			const errors = getErrorMessage(results, 'dispensationsWithPagination');
			setNotificationType(errors.notif);
			setOpenNotification(true);
		}
		setLoading(false);
	};

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
					queryArray={queryArray}
				/>
				{user.canEditDispensations && <Button
					style={{minWidth: '10%', padding: '10px'}}
					onClick={() => {
						setOpenDialog(true);
						setSelected(undefined);
					}}
					label={t(`generic.addNew`)}
					iconName={`#plus-circle`}
					primary/>}
				{user.canListDispensations && <Button
					isDisabled={tableData.length == 0}
					style={{minWidth: '10%', padding: '10px'}}
					onClick={onExport}
					label={t(`generic.export`)}
					iconName={`#download`}
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
				canModify={user.canEditDispensations}
				onRowClick={modify}
			/>
				{user.canEditDispensations && <><AddNewDispensationDialog openDialog={openDialog}
																			close={() => {
																				setOpenDialog(false);
																			}}
																			save={() => {
																				setOpenDialog(false);
																				loadFetch();
																			}}
																			onDelete={selected?.status === 'Draft' ? handleDelete : undefined}
																			selectedDispensation={selected}/>
					<DeleteDispensationDialog disp={selected}
				openDialog={openDialogDelete}
				setOpenDialog={setOpenDialogDelete}
				setOpenParentDialog={setOpenDialog}
				setDeleted={setDeleted}
			/></>}
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
