// import { Table } from '@epfl/epfl-sti-react-library';
import { DataGrid } from '@mui/x-data-grid';
import AppParams from '../components/appParams';
import exampleData from '../json/example.json';

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
	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<AppParams />
			<div
				style={{
					width: '100%',
					height: '500px',
				}}
			>
				<DataGrid
					rows={exampleData.datas}
					columns={columns}
					pageSize={5}
					rowsPerPageOptions={[5]}
					checkboxSelection
				/>
			</div>
		</div>
	);
}
