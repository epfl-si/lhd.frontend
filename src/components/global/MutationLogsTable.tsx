import * as React from 'react';
import {splitCamelCase} from "../../utils/ressources/jsonUtils";

interface MutationLogsTableProps {
	history: any[];
}

export const MutationLogsTable = ({
	history
}: MutationLogsTableProps) => {
	console.log(history)

	return (history && history.length > 0 && <table style={{ borderCollapse: "collapse", width: "100%" }}>
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
	</table>)
}
