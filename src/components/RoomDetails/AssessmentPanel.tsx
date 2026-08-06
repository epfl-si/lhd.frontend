import React, {useEffect, useState} from 'react';
import "../../../css/styles.scss";
import {assessmentType, columnType, dispensationType, notificationType} from "../../utils/ressources/types";
import {env} from "../../utils/env";
import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import {ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary, Typography} from "@material-ui/core";
import {useTranslation} from "react-i18next";
import {EntriesTableCategory} from "../Table/EntriesTableCategory";
import {GridRenderCellParams} from "@mui/x-data-grid";
import {getErrorMessage} from "../../utils/graphql/Utils";
import Notifications from "../Table/Notifications";
import {fetchAssessments, fetchDispensations} from "../../utils/graphql/FetchingTools";
import { getFormattedDate } from '../../utils/ressources/parser';
import {Button} from "epfl-elements-react-si-extra";

interface AssessmentPanelProps {
	room: string;
}

export const AssessmentPanel = ({
	room,
}: AssessmentPanelProps) => {
	const { t } = useTranslation();
	const oidc = useOpenIDConnectContext();
	const [assessments, setAssessments] = React.useState<assessmentType[]>([]);
	const [loading, setLoading] = useState(false);
	const [notificationType, setNotificationType] = useState<notificationType>({
		type: "info",
		text: '',
	});
	const [openNotification, setOpenNotification] = useState<boolean>(false);

	const columnsLarge: columnType[] = [
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
		{field: "assessment_tickets", headerName: t('assessment.tickets'), flex: 0.2,
			renderCell: (params: GridRenderCellParams<any, assessmentType>) => (
				<div style={{display: "flex", flexDirection: "column", fontSize: "smaller"}}>
					{params.row.assessment_tickets.map(item => {
							return (
								<span>• <a href={`https://go.epfl.ch/${item.ticket_number}`} target="_blank">{item.ticket_number}</a><br/></span>
							)
						}
					)}
				</div>
			),
		}
	];

	useEffect(() => {
		load();
	}, [room]);

	const load = async () => {
		setLoading(true);
		const results = await fetchAssessments(
			env().REACT_APP_GRAPHQL_ENDPOINT_URL,
			oidc.accessToken,
			0,0,
			`Room=${room}`
		);

		if (results.status === 200 && results.data){
			setAssessments(results.data.assessment);
		} else {
			const errors = getErrorMessage(results, 'assessmentWithPagination');
			setNotificationType(errors.notif);
			setOpenNotification(true);
		}
		setLoading(false);
	}

	const handleClose = () => {
		setOpenNotification(false);
	};

	return <div className="form-card-div">
		<ExpansionPanel style={{width: '100%'}}>
			<ExpansionPanelSummary expandIcon="▽" style={{backgroundColor: '#fafafa'}}>
				<Typography style={{textDecoration: 'underline', textDecorationColor: 'red'}}>
					{t('menu.assessments')}</Typography>
			</ExpansionPanelSummary>
			<ExpansionPanelDetails style={{display: "flex", flexDirection: "column"}}>
				<EntriesTableCategory
					tableData={assessments}
					columns={columnsLarge}
					loading={loading}
					pageToOpen={"assessment"}
				/>
			</ExpansionPanelDetails>
		</ExpansionPanel>
		<Notifications
			open={openNotification}
			notification={notificationType}
			close={handleClose}
		/>
	</div>
};
