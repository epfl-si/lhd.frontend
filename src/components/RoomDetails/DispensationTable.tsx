import { DataGrid, GridColDef } from '@mui/x-data-grid';

type DispensationTableProps = {
	data: any;
};

export default function DispensationTable({ data }: DispensationTableProps) {
	const columns: GridColDef[] = [
		{ field: 'slug', headerName: 'Dispensation', minWidth: 125, flex: 1 },
		{ field: 'subject', headerName: 'Subject', minWidth: 125, flex: 1 },
		{ field: 'date_end', headerName: 'Expiration Date', minWidth: 125, flex: 1 },
		{ field: 'status', headerName: 'Status', minWidth: 125, flex: 1 },
		{ field: 'holders', headerName: 'Holders', minWidth: 125, flex: 1 },
	];

	const shownData = data
		? data?.map((e: any) => ({
				id: e.slug,
				slug: e.slug,
				subject: e.versions[0].subject,
				date_end: e.versions[0].date_end,
				status: e.versions[0].status,
				holders: e.versions[0].holders.map((e: any) => e.name).join(', '),
		  }))
		: null;

	return (
		<>
			{shownData === null ? (
				<p>No dispensations</p>
			) : (
				<DataGrid
					rows={shownData}
					columns={columns}
					pageSize={5}
					rowsPerPageOptions={[5]}
					disableSelectionOnClick
					autoHeight
				/>
			)}
		</>
	);
}
