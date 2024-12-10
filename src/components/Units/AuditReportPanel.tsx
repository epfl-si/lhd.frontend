import React, {useEffect} from 'react';
import "../../../css/styles.scss";
import {lhdUnitsType, reportFile} from "../../utils/ressources/types";
import {fetchReportFiles} from "../../utils/graphql/FetchingTools";
import {env} from "../../utils/env";
import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import {FormCard} from "epfl-elements-react/src/stories/molecules/FormCard.tsx";
import {handleClickFileLink} from "../../utils/ressources/file";
import {Style} from "node:util";
import {ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary, Typography} from "@material-ui/core";

interface AuditReportPanelProps {
	lhd_units: lhdUnitsType[];
	style?: Style;
}

export const AuditReportPanel = ({
	lhd_units,
	style
}: AuditReportPanelProps) => {
	const oidc = useOpenIDConnectContext();
	const [reportFiles, setReportFiles] = React.useState<{unitName: string, reports: reportFile[]}[]>([]);

	useEffect(() => {
		loadReportFiles(lhd_units.map(u => u.id));
	}, [lhd_units]);

	const loadReportFiles = async (unitId: string[]) => {
		const reports = await fetchReportFiles(
			env().REACT_APP_GRAPHQL_ENDPOINT_URL,
			oidc.accessToken,
			unitId
		);

		if (reports.status === 200 && reports.data) {
			const groupedReports = reports.data.reduce((result: any, currentValue: any) => {
				if (!result[currentValue['unitName']]) {
					result[currentValue['unitName']] = [];
				}
				result[currentValue['unitName']].push(currentValue);
				return result;
			}, {});

			const list = Object.keys(groupedReports).map(unitName => ({
				unitName,
				reports: groupedReports[unitName]
			}));
			setReportFiles(list);
		} else {
			setReportFiles([]);
		}
	}

	return <div className="form-card-div">
		{reportFiles &&
		<ExpansionPanel style={{width: '100%'}}>
			<ExpansionPanelSummary expandIcon="▽" style={{backgroundColor: '#fafafa'}}>
				<Typography style={{textDecoration: 'underline', textDecorationColor: 'red'}}>Audits</Typography>
			</ExpansionPanelSummary>
			<ExpansionPanelDetails style={{display: "flex", flexDirection: "column"}}>
				{reportFiles.map(report => {
					return (<FormCard
						style={style}
						keyValue={report.unitName}
						key={report.unitName}>
						<div className="displayFlexColumn">
							<small className="text-muted" style={{fontWeight: "bold"}}>
								{report.unitName}
							</small>
							{report.reports.map(file => {
								if(file && file.path) {
									return <a style={{fontSize: 'small'}}
														onClick={e => handleClickFileLink(e, oidc.accessToken, file.path)}
														href={file.path}>
										{file.name}
									</a>
								} else {
									return <></>
								}
							})}
						</div>
					</FormCard>)
				})}
			</ExpansionPanelDetails>
		</ExpansionPanel>}
	</div>
};
