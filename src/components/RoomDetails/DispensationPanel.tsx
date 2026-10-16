import React, {useEffect, useState} from 'react';
import "../../../css/styles.scss";
import {columnType, dispensationType, notificationType} from "../../utils/ressources/types";
import {env} from "../../utils/env";
import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import {useTranslation} from "react-i18next";
import {EntriesTableCategory} from "../Table/EntriesTableCategory";
import {GridRenderCellParams} from "@mui/x-data-grid";
import {getErrorMessage} from "../../utils/graphql/Utils";
import Notifications from "../Table/Notifications";
import {fetchDispensations} from "../../utils/graphql/FetchingTools";
import {getFormattedDate} from '../../utils/ressources/parser';
import {Accordion, AccordionDetails, AccordionSummary, Typography} from '@mui/material';

interface DispensationPanelProps {
	room: string;
}

export const DispensationPanel = ({
	room,
}: DispensationPanelProps) => {
	const { t } = useTranslation();
	const oidc = useOpenIDConnectContext();
	const [dispensations, setDispensations] = React.useState<dispensationType[]>([]);
	const [loading, setLoading] = useState(false);
	const [notificationType, setNotificationType] = useState<notificationType>({
		type: "info",
		text: '',
	});
	const [openNotification, setOpenNotification] = useState<boolean>(false);

	const columnsLarge: columnType[] = [
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
		{field: "dispensation_rooms", headerName: t('dispensation.room'), flex: 0.1,
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
		{field: "dispensation_units", headerName: t('dispensation.unit'), flex: 0.1,
			renderCell: (params: GridRenderCellParams<any, dispensationType>) => (
				<div className="form-card-div">
					{params.row.dispensationUnits.map(item => {
							return <span>• <a href={`/unitdetails?unit=${encodeURIComponent(item.name)}`} target="_blank">{item.name}</a><br/></span>
						}
					)}
				</div>
			),
		},
		{field: "dispensation_holders", headerName: t('dispensation.holders'), flex: 0.2,
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
		{field: "dispensation_tickets", headerName: t('dispensation.tickets'), flex: 0.2,
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

	useEffect(() => {
		load();
	}, [room]);

	const load = async () => {
		setLoading(true);
		const results = await fetchDispensations(
			env().REACT_APP_GRAPHQL_BACKEND_ENDPOINT_URL,
			oidc.accessToken,
			0,0,
			`Room=${room}`
		);

		if (results.status === 200 && results.data){
			setDispensations(results.data.dispensations);
		} else {
			const errors = getErrorMessage(results, 'dispensationsWithPagination');
			setNotificationType(errors.notif);
			setOpenNotification(true);
		}
		setLoading(false);
	}

	const handleClose = () => {
		setOpenNotification(false);
	};

	return <div className="form-card-div">
		<Accordion style={{width: '100%'}}>
			<AccordionSummary expandIcon="▽" style={{backgroundColor: '#fafafa'}}>
				<Typography style={{textDecoration: 'underline', textDecorationColor: 'red'}}>
					{t('dispensation.dispensation')}</Typography>
			</AccordionSummary>
			<AccordionDetails style={{display: "flex", flexDirection: "column"}}>
				<EntriesTableCategory
					tableData={dispensations}
					columns={columnsLarge}
					loading={loading}
					pageToOpen={"dispensation"}
				/>
			</AccordionDetails>
		</Accordion>
		<Notifications
			open={openNotification}
			notification={notificationType}
			close={handleClose}
		/>
	</div>
};
