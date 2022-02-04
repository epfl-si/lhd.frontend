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
import { useHistory } from 'react-router-dom';
import uData from '../json/example.json';
import TableSmartbar from './Searchbar/TableSmartbar';

export const columns = [
	// ? I am keeping these comments for now, just in case there's a better way to do it.
	// { field: 'building', headerName: 'Building', width: 130 },
	// { field: 'sector', headerName: 'Sector', width: 130 },
	// { field: 'floor', headerName: 'Floor', width: 130 },
	// { field: 'room', headerName: 'Room', width: 130 },
	{ field: 'location', headerName: 'Location', width: 130 },
	{ field: 'designation', headerName: 'Designation', width: 130 },
	{ field: 'cosec', headerName: 'Cosec', width: 130 },
	{ field: 'responsible', headerName: 'Responsible', width: 130 },
	{ field: 'faculty', headerName: 'Faculty', width: 130 },
	{ field: 'institute', headerName: 'Institute', width: 130 },
	{ field: 'unit', headerName: 'Unit', width: 130 },
	{ field: 'update', headerName: 'Update', width: 130 },
];

export default function AppTable() {
	const notifTypes = [
		{
			type: 'success',
			text: 'Successfully copied link w/ parameters to clipboard !',
		},
		{ type: 'error', text: 'You have no query filters to share !' },
	];

	const [paramsData, setParamsData] = useState([]);
	const [optionsList, setOptionsList] = useState([]);
	const [autoComplete, setAutoComplete] = useState();
	const [openNotification, setOpenNotification] = useState(false);
	const [notificationType, setNotificationType] = useState(notifTypes[0]);
	const history = useHistory();

	const handleClose = (event, reason) => {
		if (reason === 'clickaway') {
			return;
		}

		setOpenNotification(false);
	};

	const onShare = () => {
		optionsList.length > 0 &&
			navigator.clipboard.writeText(
				`${window.location.origin}/?filters=${optionsList
					.map(o => `${o.value}:${o.label}`)
					.join(',')}`
			);

		setNotificationType(optionsList.length > 0 ? notifTypes[0] : notifTypes[1]);
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
		onLoad();
	}, []);

	useEffect(() => {
		history.replace(
			optionsList.length > 0
				? `/?filters=${optionsList.map(o => `${o.value}:${o.label}`).join(',')}`
				: ''
		);
	}, [history, optionsList]);

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
				<Alert
					onClose={handleClose}
					severity={notificationType.type}
					sx={{ width: '100%' }}
				>
					{notificationType.text}
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
	const formattedData = uData.map(entry => ({
		id: entry.id,
		location: `${entry.building} ${entry.sector} ${entry.floor} ${entry.room}`,
		designation: entry.designation,
		cosec: entry.cosec,
		responsible: entry.responsible,
		faculty: entry.faculty,
		institute: entry.institute,
		unit: entry.unit,
		update: entry.update,
	}));

	const shownData = useMemo(
		() =>
			optionsList?.length === 0
				? formattedData
				: formattedData.filter(e =>
						optionsList.every(p =>
							String(
								e[
									p.label === 'building' || 'sector' || 'floor' || 'room'
										? 'location'
										: p.label
								]
							)
								.toUpperCase()
								.includes(p.value.toUpperCase())
						)
				  ),
		[optionsList, formattedData]
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
