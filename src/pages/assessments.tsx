import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import React, {useEffect, useState} from "react";
import {env} from "../utils/env";
import {Box, Typography, useMediaQuery} from "@material-ui/core";
import {EntriesTableCategory} from "../components/Table/EntriesTableCategory";
import {assessmentType, columnType, notificationType, UserInfo} from "../utils/ressources/types";
import {useTranslation} from "react-i18next";
import {GridRenderCellParams} from "@mui/x-data-grid";
import {Redirect} from "react-router-dom";
import "../../css/styles.scss";
import {MultipleAutocomplete} from "../components/global/MultipleAutocomplete";
import Notifications from "../components/Table/Notifications";
import {Button} from "epfl-elements-react-si-extra";
import {getErrorMessage} from "../utils/graphql/Utils";
import {fetchAssessments} from "../utils/graphql/FetchingTools";
import {exportToExcel, getExportFileName} from "../utils/ressources/file";
import {formatDate, getFormattedDate} from "../utils/ressources/parser";
import {getQueryStringArray} from "../utils/web/URLUtils";
import {AddNewAssessmentDialog} from "../components/assessment/AddNewAssessmentDialog";
import {DeleteAssessmentDialog} from "../components/assessment/DeleteAssessmentDialog";

interface AssessmentDecisionControlProps {
	handleCurrentPage: (page: string) => void;
	user: UserInfo;
}

export const AssessmentDecisionControl = ({
	handleCurrentPage,
	user
}: AssessmentDecisionControlProps) => {
	const { t } = useTranslation();
	const oidc = useOpenIDConnectContext();
	const [openDialog, setOpenDialog] = useState<boolean>(false);
	const [tableData, setTableData] = useState<assessmentType[]>([]);
	const [selected, setSelected] = useState<assessmentType>();
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
		{field: "assessment", headerName: t('assessment.assessment'), flex: 0.2,
			renderCell: (params: GridRenderCellParams<any, assessmentType>) => {
				return <>{params.row.assessment}</>
			}},
		{field: "subject", headerName: t('assessment.subject'), flex: 0.1,
			renderCell: (params: GridRenderCellParams<any, assessmentType>) => {
				return <>{params.row.subject_other ? `${params.row.subject} (${params.row.subject_other})` : params.row.subject}</>
			}},
		{field: "date", headerName: t('assessment.date'), flex: 0.1,
			renderCell: (params: GridRenderCellParams<any, assessmentType>) => {
				const date = new Date(params.row.date);
				return getFormattedDate(date);
			},},
		{field: "status", headerName: t('assessment.status'), flex: 0.1,
			renderCell: (params: GridRenderCellParams<any, assessmentType>) => {
				return <>{params.row.status}</>
			}},
		{field: "assessment_rooms", headerName: t('assessment.room'), flex: 0.1,
			renderCell: (params: GridRenderCellParams<any, assessmentType>) => (
					<div className="form-card-div">
						{params.row.assessment_rooms.map(item => {
								return (
									item.isDeleted ? <span style={{color: "red", textDecoration: "line-through"}}>• {item.name}<br/></span> : <span>• <a href={`/roomdetails?room=${encodeURIComponent(item.name)}`} target="_blank">{item.name}</a><br/></span>
								)
							}
						)}
					</div>
			),
		},
		{field: "assessment_units", headerName: t('assessment.unit'), flex: 0.1,
			renderCell: (params: GridRenderCellParams<any, assessmentType>) => (
				<div className="form-card-div">
					{params.row.assessment_units.map(item => {
							return <span>• <a href={`/unitdetails?unit=${encodeURIComponent(item.name)}`} target="_blank">{item.name}</a><br/></span>
						}
					)}
				</div>
			),
		},
		{field: "assessment_contacts", headerName: t('assessment.contacts'), flex: 0.2,
			renderCell: (params: GridRenderCellParams<any, assessmentType>) => (
				<div className="form-card-div">
					{params.row.assessment_contacts.map(item => {
							return (
								<span>• {item.name} {item.surname} ({item.sciper})<br/></span>
							)
						}
					)}
				</div>
			),
		},
		{field: "assessment_tickets", headerName: t('assessment.references'), flex: 0.2,
			renderCell: (params: GridRenderCellParams<any, assessmentType>) => (
				<div className="form-card-div">
					{params.row.assessment_tickets.map(item => {
							return (
								<span>• {item.ticket_number}<br/></span>
							)
						}
					)}
				</div>
			),
		},
		{field: "id", headerName: t('organism.actions'), flex: 0.2,
			renderCell: (params: GridRenderCellParams<any, assessmentType>) => (
				user.canEditAssessments ? <>
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
		{field: "assessment", headerName: t('assessment.assessment'), flex: 0.2,
			renderCell: (params: GridRenderCellParams<any, assessmentType>) => {
				return <div style={{display: "flex", flexDirection: "column", fontSize: "smaller"}}>
					<span>{params.row.assessment}</span>
					<b style={{fontSize: "smaller"}}>{params.row.status}</b>
					<b style={{fontSize: "smaller"}}>{params.row.subject_other ? `${params.row.subject} (${params.row.subject_other})` : params.row.subject}</b>
				</div>
			}},
		{field: "creation_date", headerName: t('assessment.created'), flex: 0.1,
			renderCell: (params: GridRenderCellParams<any, assessmentType>) => {
				const date = new Date(params.row.date);
				return <div style={{display: "flex", flexDirection: "column", fontSize: "smaller"}}>
					<span><b>{t('generic.from')}</b> {getFormattedDate(date)}</span>
				</div>
			}},
		{field: "assessment_rooms", headerName: t('assessment.room'), flex: 0.1,
			renderCell: (params: GridRenderCellParams<any, assessmentType>) => (
				<div style={{display: "flex", flexDirection: "column", fontSize: "smaller"}}>
					{params.row.assessment_rooms.map(item => {
							return (
								item.isDeleted ? <span style={{color: "red", textDecoration: "line-through"}}>• {item.name}<br/></span> : <span>• <a href={`/roomdetails?room=${encodeURIComponent(item.name)}`} target="_blank">{item.name}</a><br/></span>
							)
						}
					)}
				</div>
			),
		},
		{field: "assessment_units", headerName: t('assessment.unit'), flex: 0.1,
			renderCell: (params: GridRenderCellParams<any, assessmentType>) => (
				<div className="form-card-div">
					{params.row.assessment_units.map(item => {
							return <span>• <a href={`/unitdetails?unit=${encodeURIComponent(item.name)}`} target="_blank">{item.name}</a><br/></span>
						}
					)}
				</div>
			),
		},
		{field: "assessment_contacts", headerName: t('assessment.contacts'), flex: 0.2,
			renderCell: (params: GridRenderCellParams<any, assessmentType>) => (
				<div style={{display: "flex", flexDirection: "column", fontSize: "smaller"}}>
					{params.row.assessment_contacts.map(item => {
							return (
								<span>• {item.name} {item.surname} ({item.sciper})<br/></span>
							)
						}
					)}
				</div>
			),
		},
		{field: "assessment_tickets", headerName: t('assessment.references'), flex: 0.2,
			renderCell: (params: GridRenderCellParams<any, assessmentType>) => (
				<div style={{display: "flex", flexDirection: "column", fontSize: "smaller"}}>
					{params.row.assessment_tickets.map(item => {
							return (
								<span>• {item.ticket_number}<br/></span>
							)
						}
					)}
				</div>
			),
		}
	];

	const columnsSmall: columnType[] = [
		{field: "assessment", headerName: t('assessment.assessment'), flex: 0.2,
		renderCell: (params: GridRenderCellParams<any, assessmentType>) => {
			const date = new Date(params.row.date);
			const rooms = params.row.assessment_rooms.map(item => {
					return (
						item.isDeleted ? <span style={{color: "red", textDecoration: "line-through"}}>• {item.name}<br/></span> : <span>• <a href={`/roomdetails?room=${encodeURIComponent(item.name)}`} target="_blank">{item.name}</a><br/></span>
					)
				}
			);
			const contacts = params.row.assessment_contacts.map(item => {
					return (
						<span>• {item.name} {item.surname} ({item.sciper})<br/></span>
					)
				}
			);
			const units= params.row.assessment_units.map(item => {
				return <span>• <a href={`/unitdetails?unit=${encodeURIComponent(item.name)}`} target="_blank">{item.name}</a><br/></span>
			});
			const tickets = params.row.assessment_tickets.map(item => {
					return (
						<span>• {item.ticket_number}<br/></span>
					)
				}
			);
			return <div style={{display: "flex", flexDirection: "column", fontSize: "smaller"}}>
				<span>{params.row.assessment}</span>
				<b style={{fontSize: "smaller"}}>{params.row.status}</b>
				<span><b>{t('generic.from')}</b> {getFormattedDate(date)}</span>
				{rooms}
				{units}
				{contacts}
				{tickets}
			</div>
		}}
	];

	useEffect(() => {
		if (user.canListAssessments) {
			loadFetch();
			setDeleted(false);
			setSelected(undefined);
		}
	}, [search, page, user.canListAssessments, deleted]);

	useEffect(() => {
		handleCurrentPage("assessmentscontrol");
	}, [oidc.accessToken]);

	const loadFetch = async () => {
		setLoading(true);
		const results = await fetchAssessments(
			env().REACT_APP_GRAPHQL_ENDPOINT_URL,
			oidc.accessToken,
			PAGE_SIZE,
			PAGE_SIZE * page,
			search
		);
		if (results.status === 200 && results.data){
			setTableData(results.data.assessment);
			setTotalCount(results.data.totalCount);
		} else {
			const errors = getErrorMessage(results, 'assessmentWithPagination');
			setNotificationType(errors.notif);
			setOpenNotification(true);
		}
		setLoading(false);
	};

	const handleClose = () => {
		setOpenNotification(false);
	};

	const handleDelete = (data: assessmentType) => {
		setOpenDialogDelete(true);
		setSelected(data);
	}

	const modify = (data: assessmentType) => {
		setOpenDialog(true);
		setSelected(data);
	}

	const onExport = async () => {
		setLoading(true);
		const results = await fetchAssessments(
			env().REACT_APP_GRAPHQL_ENDPOINT_URL,
			oidc.accessToken,
			0, 0,
			search
		);

		if ( results.status === 200 && results.data ) {
			const fileName = search.split('&')
				.map(part => part.split('=')[1])
				.join('_');
			const parsedResults = results.data.assessment.map((ass: assessmentType) => {
				return {
					assessment: ass.assessment,
					date: formatDate(new Date(ass.date), true),
					subject: ass.subject,
					subject_other: ass.subject_other ?? '',
					description: ass.description,
					conclusion: ass.conclusion ?? '',
					created_by: ass.created_by,
					created_on: formatDate(new Date(ass.created_on), true),
					modified_by: ass.modified_by,
					modified_on: formatDate(new Date(ass.modified_on), true),
					rooms: ass.assessment_rooms.map(room => room.name),
					units: ass.assessment_units.map(unit => unit.name),
					contacts: ass.assessment_contacts.map(holder => `${holder.name} ${holder.surname} (${holder.sciper})`),
					status: ass.status,
					tickets: ass.assessment_tickets.map(ticket => ticket.ticket_number)
				}
			});
			exportToExcel(parsedResults, getExportFileName(search !== '' ? `assessments_${fileName}` : 'assessments'));
		} else {
			const errors = getErrorMessage(results, 'assessmentWithPagination');
			setNotificationType(errors.notif);
			setOpenNotification(true);
		}
		setLoading(false);
	};

	return (
		<Box>
			{user.canListAssessments ? <>
			<Typography gutterBottom>
				{t(`menu.assessments`)}
			</Typography>
			<div className="utilsBar">
				<MultipleAutocomplete
					setPage={setPage}
					setSearch={setSearch}
					parent="assessmentscontrol"
					queryArray={queryArray}
				/>
				{user.canEditAssessments && <Button
					style={{minWidth: '10%', padding: '10px'}}
					onClick={() => {
						setOpenDialog(true);
						setSelected(undefined);
					}}
					label={t(`generic.addNew`)}
					iconName={`#plus-circle`}
					primary/>}
				{user.canListAssessments && <Button
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
				pageToOpen={"assessment"}
				loadServerRows={setPage}
				page={page}
				totalCount={totalCount}
				pageSize={PAGE_SIZE}
				canModify={user.canEditAssessments}
				onRowClick={modify}
			/>
				{user.canEditAssessments && <><AddNewAssessmentDialog openDialog={openDialog}
																			close={() => {
																				setOpenDialog(false);
																			}}
																			save={() => {
																				setOpenDialog(false);
																				loadFetch();
																			}}
																			onDelete={selected?.status === 'Draft' ? handleDelete : undefined}
																			selectedAssessment={selected}/>
			<DeleteAssessmentDialog assessment={selected}
									openDialog={openDialogDelete}
									setOpenDialog={setOpenDialogDelete}
									setOpenParentDialog={setOpenDialog}
									setDeleted={setDeleted}
			/>
				</>}
				<Notifications
					open={openNotification}
					notification={notificationType}
					close={handleClose}
				/>
				{deleted && <Redirect to="/assessmentscontrol"/>}
			</> : <b>You are not authorized for this page</b>}
		</Box>
	);
}
