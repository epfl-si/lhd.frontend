import { DataGrid } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import uData from '../json/example2.json';
import AppParams from '../components/appParams';

export default function AppTable() {
	const [paramsList, setParamsList] = useState();
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
	let rows = {
		Building: [],
		Room: [],
		Designation: [],
		Cosec: [],
		Responsible: [],
		Faculty: [],
		Institute: [],
		Unit: [],
	};
	useEffect(() => {
		uData.forEach(e => {
			rows.Building.push(e.building);
			rows.Room.push(e.room);
			rows.Designation.push(e.designation);
			rows.Cosec.push(e.cosec);
			rows.Responsible.push(e.responsible);
			rows.Faculty.push(e.faculty);
			rows.Institute.push(e.institute);
			rows.Unit.push(e.unit);
		});
		Object.entries(rows).map(
			e => (rows[e[0]] = e[1].filter((e, i, a) => a.indexOf(e) === i))
		);
		setParamsList(rows);
	}, []);
	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<AppParams pList={paramsList} />
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
