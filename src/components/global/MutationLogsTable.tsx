import * as React from 'react';
import {splitCamelCase} from "../../utils/ressources/jsonUtils";
import {ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary, Typography} from "@material-ui/core";
import {useTranslation} from "react-i18next";

interface MutationLogsTableProps {
	history: any[];
}

export const MutationLogsTable = ({
	history
}: MutationLogsTableProps) => {
	const { t } = useTranslation();

	return (history && history.length > 0 ? <ExpansionPanel style={{width: '100%'}}>
		<ExpansionPanelSummary expandIcon="▽" style={{backgroundColor: '#fafafa'}}>
			<Typography style={{textDecoration: 'underline', textDecorationColor: 'red'}}>
				{t('dispensation.history')}</Typography>
		</ExpansionPanelSummary>
		<ExpansionPanelDetails style={{display: "flex", flexDirection: "column"}}>
			<table style={{ borderCollapse: "collapse", width: "100%" }}>
				<thead>
				<tr>
					<th>Modified On</th>
					<th>Modified By</th>
					<th>Field</th>
					<th>Before</th>
					<th>After</th>
				</tr>
				</thead>
				<tbody>
				{history.map((group, groupIndex) =>
					group.diffs.map((diff, diffIndex) => (
						<tr key={`${groupIndex}-${diffIndex}`}
								style={{
									borderTop: diffIndex === 0 ? "1px solid rgb(183 180 180)" : "1px dashed #ddd"
								}}>
							{diffIndex === 0 && (
								<>
									<td rowSpan={group.diffs.length} style={{width: '10%'}} className="table-mutation-logs">
										{group.modified_on}
									</td>
									<td rowSpan={group.diffs.length} style={{width: '10%'}} className="table-mutation-logs">
										{group.modified_by}
									</td>
								</>
							)}

							<td style={{width: '15%'}} className="table-mutation-logs">{splitCamelCase(diff.field)}</td>
							<td style={{width: '30%'}} className="table-mutation-logs">{String(diff.before ?? "–")}</td>
							<td style={{width: '35%'}} className="table-mutation-logs">{String(diff.after ?? "–")}</td>
						</tr>
					))
				)}
				</tbody>
			</table>
		</ExpansionPanelDetails>
	</ExpansionPanel> : <></>)
}
