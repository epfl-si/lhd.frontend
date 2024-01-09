import { Box } from '@material-ui/core';
import { DataGrid } from '@mui/x-data-grid';
import { useMemo } from 'react';
import { TableToolbar } from './TableToolbar';
import { useHistory } from 'react-router-dom';
import { columnType, parameterType } from '../../utils/ressources/types';

type EntriesTableCategoryProps = {
	optionsList: parameterType[];
	tableData: Object[];
	columns: columnType[];
	loading: boolean;
	page:  'room' | 'unit';
};

export function EntriesTableCategory({
	optionsList,
	tableData,
	columns,
	loading,
	page
}: EntriesTableCategoryProps) {
	const history = useHistory();
	const shownData = useMemo(
		() =>
			optionsList?.length === 0
				? tableData
				: tableData.filter(e =>
						optionsList.every((p: parameterType) =>
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
					onRowClick={e => {
						switch ( page ) {
							case "room":
								history.push(`/roomdetails?room=${e.row['room.name']}`);
								break;
							case "unit":
								history.push(`/unitdetails?unit=${e.row['unit.name']}`);
						}
					}}
				/>
			) : (
				<p>This space unintentionnally left unblank</p>
			)}
		</Box>
	);
}
