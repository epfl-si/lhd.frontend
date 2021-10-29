import { MDBDataTable } from 'mdbreact';
import AppParams from '../components/appParams';
import exampleData from '../json/example.json';

export default function AppTable() {
	const data = {
		columns: [
			{
				label: 'Building',
				field: 'building',
				sort: 'asc',
				width: 150,
			},
			{
				label: 'Sector',
				field: 'sector',
				sort: 'asc',
				width: 270,
			},
			{
				label: 'Floor',
				field: 'floor',
				sort: 'asc',
				width: 200,
			},
			{
				label: 'Room',
				field: 'room',
				sort: 'asc',
				width: 100,
			},
			{
				label: 'Designation',
				field: 'designation',
				sort: 'asc',
				width: 150,
			},
			{
				label: 'Cosec',
				field: 'cosec',
				sort: 'asc',
				width: 150,
			},
			{
				label: 'Responsible',
				field: 'responsible',
				sort: 'asc',
				width: 150,
			},
			{
				label: 'Faculty',
				field: 'faculty',
				sort: 'asc',
				width: 150,
			},
			{
				label: 'Institute',
				field: 'institute',
				sort: 'asc',
				width: 150,
			},
			{
				label: 'Unit',
				field: 'unit',
				sort: 'asc',
				width: 150,
			},
			{
				label: 'Update',
				field: 'update',
				sort: 'asc',
				width: 150,
			},
		],
		rows: exampleData.datas,
	};
	return (
		<div>
			<AppParams />
			<MDBDataTable striped bordered small responsive data={data} />
		</div>
	);
}
