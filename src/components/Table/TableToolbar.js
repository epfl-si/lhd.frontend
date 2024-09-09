import {
	GridToolbarColumnsButton,
	GridToolbarContainer,
	GridToolbarDensitySelector,
	GridToolbarExport,
} from '@mui/x-data-grid';

export function TableToolbar() {
	return (
		<GridToolbarContainer>
			<GridToolbarColumnsButton />
			{/*<GridToolbarDensitySelector />*/}
			<GridToolbarExport />
		</GridToolbarContainer>
	);
}
