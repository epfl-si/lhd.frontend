import React, {useEffect, useState} from 'react';
import "../../../css/styles.scss";
import {columnType, dispensationType, notificationType} from "../../utils/ressources/types";
import {env} from "../../utils/env";
import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import {ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary, Typography} from "@material-ui/core";
import {useTranslation} from "react-i18next";
import {EntriesTableCategory} from "../Table/EntriesTableCategory";
import {GridRenderCellParams} from "@mui/x-data-grid";
import {getErrorMessage} from "../../utils/graphql/Utils";
import Notifications from "../Table/Notifications";
import {fetchDispensations} from "../../utils/graphql/FetchingTools";

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
		{field: "dispensation", headerName: t('dispensation.dispensation'), flex: 0.1,
			renderCell: (params: GridRenderCellParams<any, dispensationType>) => {
				return <>{params.row.dispensation}</>
			}},
		{field: "subject", headerName: t('dispensation.subject'), flex: 0.1,
			renderCell: (params: GridRenderCellParams<any, dispensationType>) => {
				return <>{params.row.subject_other ? `${params.row.subject} (${params.row.subject_other})` : params.row.subject}</>
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
		}
	];

	useEffect(() => {
		load();
	}, [room]);

	const load = async () => {
		setLoading(true);
		const results = await fetchDispensations(
			env().REACT_APP_GRAPHQL_ENDPOINT_URL,
			oidc.accessToken,
			0,0,
			`Room=${room}`
		);

		debugger;
		if (results.status === 200 && results.data){
			setDispensations(results.data.dispensations);
		} else {
			const errors = getErrorMessage(results, 'dispensationsByRoom');
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
					{t('dispensation.dispensation')}</Typography>
			</ExpansionPanelSummary>
			<ExpansionPanelDetails style={{display: "flex", flexDirection: "column"}}>
				<EntriesTableCategory
					tableData={dispensations}
					columns={columnsLarge}
					loading={loading}
					pageToOpen={"dispensation"}
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
