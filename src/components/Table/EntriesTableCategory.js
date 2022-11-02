import { DataGrid } from '@mui/x-data-grid';
import { useMemo } from 'react';
import { TableToolbar } from './TableToolbar';

export function EntriesTableCategory({ optionsList, tableData, columns }) {
	const shownData = useMemo(
		() =>
			optionsList?.length === 0
				? tableData
				: tableData.filter(e =>
						optionsList.every(p =>
							String(e[p.label]).toUpperCase().includes(p.value.toUpperCase())
						)
				  ),
		[optionsList, tableData]
	);

	return (
		<DataGrid
			disableSelectionOnClick={true}
			rows={shownData}
			columns={columns}
			components={{
				Toolbar: TableToolbar,
			}}
		/>
	);
}
