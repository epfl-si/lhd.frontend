import { Box } from '@material-ui/core';
import { DataGrid } from '@mui/x-data-grid';
import { useState, useMemo } from 'react';
import uData from '../json/example2.json';
import AppCategorySearchbar from './appCategorySearchbar';

export const columns = [
	{ field: 'building', headerName: 'Building', width: 130 },
	{ field: 'sector', headerName: 'Sector', width: 130 },
	{ field: 'floor', headerName: 'Floor', width: 130 },
	{ field: 'room', headerName: 'Room', width: 130 },
	{ field: 'designation', headerName: 'Designation', width: 130 },
	{ field: 'cosec', headerName: 'Cosec', width: 130 },
	{ field: 'responsible', headerName: 'Responsible', width: 130 },
	{ field: 'faculty', headerName: 'Faculty', width: 130 },
	{ field: 'institute', headerName: 'Institute', width: 130 },
	{ field: 'unit', headerName: 'Unit', width: 130 },
	{ field: 'update', headerName: 'Update', width: 130 },
];

export default function AppTable() {
	const [paramsData, setParamsData] = useState([]);

	return (
		<Box display="flex" flexDirection="column" alignItems="center">
			<Box width="100%">
				<AppCategorySearchbar
					searchCategories={columns}
					paramsData={paramsData}
					setParamsData={setParamsData}
				/>
			</Box>
			<Box width="100%" height="500px">
				<EntriesTable paramsData={paramsData} />
			</Box>
		</Box>
	);
}

function EntriesTable({ paramsData }) {
	const shownData = useMemo(
		() =>
			paramsData?.length === 0
				? uData
				: uData.filter(e =>
						paramsData.every(p =>
							String(e[p.param]).toUpperCase().includes(p.label.toUpperCase())
						)
				  ),
		[paramsData]
	);

	return (
		<DataGrid disableSelectionOnClick={true} rows={shownData} columns={columns} />
	);
}
