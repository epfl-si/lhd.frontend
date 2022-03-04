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
//import uData from '../json/example.json';
import TableSmartbar from './Searchbar/TableSmartbar';

export const columns = [
	{ field: 'building', headerName: 'Building', width: 130, hide: true },
	{ field: 'sector', headerName: 'Sector', width: 130, hide: true },
	{ field: 'floor', headerName: 'Floor', width: 130, hide: true },
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
	const notifTypes = [
		{
			type: 'success',
			text: 'Successfully copied link w/ parameters to clipboard !',
		},
		{ type: 'error', text: 'You have no query filters to share !' },
	];

	const [tableData, setTableData] = useState(null);
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

	const fetchResults = async searchParams => {
		const results = await fetch('http://localhost:3001/', {
			headers: {
				accept: '*/*',
				'accept-language': 'en-US,en;q=0.9,fr-CH;q=0.8,fr;q=0.7',
				'content-type': 'application/json',
				'sec-ch-ua':
					'" Not A;Brand";v="99", "Chromium";v="98", "Google Chrome";v="98"',
				'sec-ch-ua-mobile': '?0',
				'sec-ch-ua-platform': '"macOS"',
				'sec-fetch-dest': 'empty',
				'sec-fetch-mode': 'cors',
				'sec-fetch-site': 'cross-site',
			},
			referrerPolicy: 'no-referrer-when-downgrade',
			body: `{"query":"query LHDDataQuery {\\n  rooms (where: { building: { equals: \\"BC\\"} }) {\\n    name\\n    occupancies { cosecs { name} }\\n  }\\n}","variables":{},"operationName":"LHDDataQuery"}`,
			method: 'POST',
			mode: 'cors',
			credentials: 'omit',
		});
		const graphQLResponse = await results.json();
		return graphQLResponse.data.rooms.map(e => ({
			id: e.name,
			room: e.name,
			unit: 'XXX COO',
			cosec: e.occupancies[0].cosecs[0].name,
			floor: 'XXX -2',
			sector: 'XXX H',
			faculty: 'XXX SV2',
			building: 'XXX 8',
			institute: 'XXX Salesforce',
			designation: 'XXX Storage',
			responsible: 'XXX Ferdinande Fendt',
		}));
	};

	const onLoad = () => {
		// TODO: Will need to put a params checker (returns an error snackbar if url param does not exist).
		let urlParams = new URLSearchParams(window.location.search);
		if (urlParams.has('filters')) {
			let filters = urlParams.get('filters').split(',');
			setOptionsList(
				filters.map(e => ({ value: e.split(':')[0], label: e.split(':')[1] }))
			);
		}
		fetchResults();
		//'{\\n  rooms (where: { building: { equals: \\"BC\\"} }) {\\n    name\\n    occupancies { cosecs { name} }\\n  }\\n}'
	};

	useEffect(() => {
		onLoad();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		history.replace(
			optionsList.length > 0
				? `/?filters=${optionsList.map(o => `${o.value}:${o.label}`).join(',')}`
				: ''
		);
	}, [history, optionsList]);

	// ! fix eslint error.
	async function reloadResults(filter) {
		setTableData(await fetchResults(filter));
	}

	useEffect(reloadResults, []);

	useEffect(() => {
		if (!tableData) return;
		setAutoComplete(
			tableData
				.map(e =>
					Object.entries(e).map(i => {
						const [lab, val] = i;
						return { value: isNaN(val) ? val : String(val), label: lab };
					})
				)
				.flat()
				.filter(e => e.label !== 'id')
				.filter(
					(compVal2, index, self) =>
						index ===
							self.findIndex(compVal1 => compVal1.value === compVal2.value) &&
						compVal2.label !== 'id'
				)
		);
	}, [tableData]);

	const Throbber = () => <p>This space unintentionnally left unblank</p>;

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
				{tableData !== null ? (
					<EntriesTableCategory optionsList={optionsList} tableData={tableData} />
				) : (
					<Throbber />
				)}
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

function EntriesTableCategory({ optionsList, tableData }) {
	const shownData = useMemo(
		() =>
			optionsList?.length === 0
				? tableData
				: tableData.filter(e =>
						optionsList.every(p =>
							String(e[p.label]).toUpperCase().includes(p.value.toUpperCase())
						)
				  ),
		[optionsList, tableData]
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
