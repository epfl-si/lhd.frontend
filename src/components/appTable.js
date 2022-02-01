import Button from '@epfl/epfl-sti-react-library/dist/Forms/Button';
import { Box, Snackbar } from '@material-ui/core';
import { Alert } from '@mui/material';
import {
	DataGrid,
	GridToolbarColumnsButton,
	GridToolbarContainer,
	GridToolbarDensitySelector,
	GridToolbarExport,
} from '@mui/x-data-grid';
import { useState, useMemo, useEffect } from 'react';
import uData from '../json/example.json';
import TableSmartbar from './Searchbar/TableSmartbar';

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
	const [optionsList, setOptionsList] = useState([]);
	const [autoComplete, setAutoComplete] = useState();
	const [openNotification, setOpenNotification] = useState(false);

	const handleClose = (event, reason) => {
		if (reason === 'clickaway') {
			return;
		}

		setOpenNotification(false);
	};

	const onShare = () => {
		navigator.clipboard.writeText(
			`${window.location.origin}/?filters=${optionsList
				.map(o => `${o.value}:${o.label}`)
				.join(',')}`
		);
		setOpenNotification(true);
	};

	const onLoad = () => {
		let urlParams = new URLSearchParams(window.location.search);
		if (urlParams.has('filters')) {
			let filters = urlParams.get('filters').split(',');
			setOptionsList(
				filters.map(e => ({ value: e.split(':')[0], label: e.split(':')[1] }))
			);
		}
	};

	useEffect(() => {
		setAutoComplete(
			uData
				.map(e =>
					Object.entries(e).map(i => {
						const [lab, val] = i;
						return { value: isNaN(val) ? val : String(val), label: lab };
					})
				)
				.flat()
				.filter(
					(compVal2, index, self) =>
						index === self.findIndex(compVal1 => compVal1.value === compVal2.value)
				)
				.filter(e => e.label !== 'id')
		);
		onLoad();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<Box display="flex" flexDirection="column" alignItems="center">
			<Box width="100%">
				<TableSmartbar
					searchCategories={columns}
					paramsData={paramsData}
					setParamsData={setParamsData}
					optionsList={optionsList}
					setOptionsList={setOptionsList}
					tableData={autoComplete}
				/>
			</Box>
			<Box width="100%" height="500px">
				<EntriesTableCategory optionsList={optionsList} />
			</Box>
			<Box width="100%" paddingY="16px">
				<Button label="Copy link w/ parameters" onClickFn={onShare} />
			</Box>
			<Snackbar
				open={openNotification}
				autoHideDuration={3000}
				onClose={handleClose}
			>
				<Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
					Successfully copied link w/ parameters to clipboard !
				</Alert>
			</Snackbar>
		</Box>
	);
}

function CustomToolbar() {
	return (
		<GridToolbarContainer>
			<GridToolbarColumnsButton />
			<GridToolbarDensitySelector />
			<GridToolbarExport />
		</GridToolbarContainer>
	);
}

function EntriesTableCategory({ optionsList }) {
	const shownData = useMemo(
		() =>
			optionsList?.length === 0
				? uData
				: uData.filter(e =>
						optionsList.every(p =>
							String(e[p.label]).toUpperCase().includes(p.value.toUpperCase())
						)
				  ),
		[optionsList]
	);

	return (
		<DataGrid
			disableSelectionOnClick={true}
			rows={shownData}
			columns={columns}
			components={{
				Toolbar: CustomToolbar,
			}}
		/>
	);
}
