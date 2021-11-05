// import { Table } from '@epfl/epfl-sti-react-library';
import { DataGrid } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import uData from '../json/example2.json';
import AppParams from '../components/appParams';

export default function AppTable() {
	const [apiData, setApiData] = useState();
	const [buList, setBuList] = useState();
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
	// useEffect(() => {
	// 	return fetch('https://retoolapi.dev/s2RCVT/data')
	// 		.then(r => r.ok && r.json())
	// 		.then(d => {
	// 			console.log(d);
	// 		});
	// }, []);
	useEffect(() => {
		setBuList(uData.map(e => e.building));
	}, []);
	// console.log(buList);
	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<AppParams buList={buList} />
			<div
				style={{
					width: '100%',
					height: '500px',
				}}
			>
				<DataGrid
					rows={uData}
					columns={columns}
					pageSize={5}
					rowsPerPageOptions={[5]}
					checkboxSelection
				/>
			</div>
		</div>
	);
}
