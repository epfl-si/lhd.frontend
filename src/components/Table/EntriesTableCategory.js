import { Box } from '@material-ui/core';
import { DataGrid } from '@mui/x-data-grid';
import { useMemo } from 'react';
import { TableToolbar } from './TableToolbar';

export function EntriesTableCategory({ optionsList, tableData, columns, loading }) {
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
		<Box width="100%" height="500px">
			{tableData !== null ? (
				<DataGrid
					loading={loading}
					disableSelectionOnClick={true}
					rows={shownData}
					columns={columns}
					components={{
						Toolbar: TableToolbar,
					}}
				/>
			) : (
				<p>This space unintentionnally left unblank</p>
			)}
		</Box>
	);
}
