import { DataGrid } from '@mui/x-data-grid';
import { useState } from 'react';
import uData from '../json/example2.json';
import AppCategorySearchbar from './appCategorySearchbar';

export default function AppTable() {
	let columns = [
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
	const [shownData, setShownData] = useState(uData);
	const [category, setCategory] = useState('building');
	const [statement, setStatement] = useState();
	const handleCategoryChange = event => {
		setCategory(event.target.value);
	};
	const handleStatementChange = event => {
		setStatement(event.target.value);
	};
	const onSearch = () => {
		setShownData(
			uData.filter(e => e[category].toLowerCase().includes(statement.toLowerCase()))
		);
	};
	const onClear = () => {
		setStatement('');
		setShownData(uData);
	};
	return (
		<div>
			<AppCategorySearchbar
				searchCategories={columns}
				categoryValue={category}
				statementValue={statement}
				onCatChange={handleCategoryChange}
				onStateChange={handleStatementChange}
				onSearch={onSearch}
				onClear={onClear}
			/>
			<div
				style={{
					width: '100%',
					height: '500px',
				}}
			>
				<DataGrid
					rows={shownData}
					columns={columns}
					pageSize={5}
					rowsPerPageOptions={[5]}
					checkboxSelection
				/>
			</div>
		</div>
	);
}
