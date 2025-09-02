import React, {useEffect, useState} from 'react';
import "../../../css/styles.scss";
import {authorizationType, columnType} from "../../utils/ressources/types";
import {
	fetchChemicalAuthorizationsByRoom,
	fetchRadioprotectionAuthorizationsByRoom
} from "../../utils/graphql/FetchingTools";
import {env} from "../../utils/env";
import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import {ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary, Typography} from "@material-ui/core";
import {useTranslation} from "react-i18next";
import {EntriesTableCategory} from "../Table/EntriesTableCategory";
import {GridRenderCellParams} from "@mui/x-data-grid";

interface AuthorizationPanelProps {
	room: string;
	type: string;
}

export const AuthorizationPanel = ({
	room,
	type
}: AuthorizationPanelProps) => {
	const { t } = useTranslation();
	const oidc = useOpenIDConnectContext();
	const [authorizations, setAuthorizations] = React.useState<authorizationType[]>([]);
	const [loading, setLoading] = useState(false);

	const columnsLarge: columnType[] = [
		{field: "authorization", headerName: t('authorization.authorization'), flex: 0.2,
			renderCell: (params: GridRenderCellParams<any, authorizationType>) => {
				return <div style={{display: "flex", flexDirection: "column", fontSize: "smaller"}}>
					<span>{params.row.unit ? params.row.unit.name : ''}</span>
					<span>{params.row.authorization}-{params.row.renewals}</span>
				</div>
			}},
		{field: "creation_date", headerName: 'Dates', flex: 0.1,
			renderCell: (params: GridRenderCellParams<any, authorizationType>) => {
				const date = new Date(params.row.creation_date);
				const dateExp = new Date(params.row.expiration_date);
				return <div style={{display: "flex", flexDirection: "column", fontSize: "smaller"}}>
					<span><b>{t('generic.from')}</b> {date.toLocaleDateString("en-GB")}</span>
					<span><b>{t('generic.to')}</b> {dateExp.toLocaleDateString("en-GB")}</span>
				</div>
			}},
		{field: "status", headerName: t('authorization.status'), flex: 0.1,
			renderCell: (params: GridRenderCellParams<any, authorizationType>) => {
				return <>{params.row.status}</>
			}},
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
		{
			field: "authorization_chemicals", headerName: type == 'IonisingRadiation' ? t('authorization.source') : t('authorization.cas'), flex: 0.2,
			renderCell: (params: GridRenderCellParams<any, authorizationType>) => (
				<div className="form-card-div">
					{type == 'IonisingRadiation' ? params.row.authorization_radiations.map(source => {
							return (
								<><span>• {source.source}</span><br/></>
							)
						}
					) : params.row.authorization_chemicals.map(chem => {
							return (
								<span>• {chem.auth_chem_en} ({chem.cas_auth_chem}) - <b
									style={{fontSize: "smaller"}}>{chem.flag_auth_chem ? t('chemical.active') : t('chemical.archived')}</b><br/></span>
							)
						}
					)}
				</div>
			),
		}
	];

	useEffect(() => {
		load();
	}, [room, type]);

	const load = async () => {
		setLoading(true);
		let results = {};

		if (type == 'Chemical')
			results = await fetchChemicalAuthorizationsByRoom(
				env().REACT_APP_GRAPHQL_ENDPOINT_URL,
				oidc.accessToken,
				room,
				type
			);
		else if (type == 'IonisingRadiation')
			results = await fetchRadioprotectionAuthorizationsByRoom(
				env().REACT_APP_GRAPHQL_ENDPOINT_URL,
				oidc.accessToken,
				room,
				type
			);
		if (results.status === 200 && results.data){
			setAuthorizations(results.data);
		} else {
			console.error('Bad GraphQL results', results);
		}
		setLoading(false);
	}

	return <div className="form-card-div">
		<ExpansionPanel style={{width: '100%'}}>
			<ExpansionPanelSummary expandIcon="▽" style={{backgroundColor: '#fafafa'}}>
				<Typography style={{textDecoration: 'underline', textDecorationColor: 'red'}}>
					{type == 'IonisingRadiation' ? t('menu.radioprotection') : t('menu.authChem')}</Typography>
			</ExpansionPanelSummary>
			<ExpansionPanelDetails style={{display: "flex", flexDirection: "column"}}>
				<EntriesTableCategory
					tableData={authorizations}
					columns={columnsLarge}
					loading={loading}
					pageToOpen={"chemicalauthorizationsByRoom"}
				/>
			</ExpansionPanelDetails>
		</ExpansionPanel>
	</div>
};
