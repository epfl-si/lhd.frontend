import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useHistory } from 'react-router-dom';
import TableSmartbar from '../Searchbar/TableSmartbar';
import { useEffect, useMemo, useState } from 'react';
import { parameterType } from '../../utils/ressources/types';
import { generateAutocompleteList } from '../../utils/graphql/ParsingTools';

type DispensationTableProps = {
	data: any;
};

export default function DispensationTable({ data }: DispensationTableProps) {
	const history = useHistory();
	const [autoComplete, setAutoComplete] = useState<parameterType[]>([]);
	const [optionsList, setOptionsList] = useState<parameterType[]>([]);
	const columns: GridColDef[] = [
		{ field: 'slug', headerName: 'Dispensation', minWidth: 125, flex: 1 },
		{ field: 'subject', headerName: 'Subject', minWidth: 125, flex: 1 },
		{ field: 'date_end', headerName: 'Expiration Date', minWidth: 125, flex: 1 },
		{ field: 'status', headerName: 'Status', minWidth: 125, flex: 1 },
		{ field: 'holders', headerName: 'Holders', minWidth: 125, flex: 1 },
	];

	const originalData = data
		? data?.map((e: any) => ({
				id: e.slug,
				slug: e.slug,
				subject: e.versions[0].subject,
				date_end: e.versions[0].date_end,
				status: e.versions[0].status,
				holders: e.versions[0].holders.map((e: any) => e.name).join(', '),
		  }))
		: null;

	const shownData = useMemo(
		() =>
			optionsList?.length === 0
				? originalData
				: originalData.filter(e =>
						optionsList.every((p: parameterType) =>
							String(e[p.label]).toUpperCase().includes(p.value.toUpperCase())
						)
				  ),
		[optionsList, originalData]
	);

	useEffect(() => {
		if (!originalData) return;
		setAutoComplete(generateAutocompleteList(originalData));
	}, [originalData]);

	return (
		<>
			{shownData === null ? (
				<p>No dispensations</p>
			) : (
				<>
					<TableSmartbar
						optionsList={optionsList}
						setOptionsList={setOptionsList}
						tableData={autoComplete}
						columns={columns}
					/>
					<DataGrid
						rows={shownData}
						columns={columns}
						pageSize={5}
						rowsPerPageOptions={[5]}
						disableSelectionOnClick
						autoHeight
						onRowClick={e => {
							history.push(`/dispcontrol?tab=update&slug=${e.row['slug']}`);
						}}
					/>
				</>
			)}
		</>
	);
}
