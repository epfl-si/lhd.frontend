import Button from '@epfl/epfl-sti-react-library/dist/Forms/Button';
import { Box } from '@material-ui/core';
import { DataGrid } from '@mui/x-data-grid';
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

	const onShare = () => {
		console.log(
			`${window.location.href}?filters=${optionsList
				.map(o => `${o.value}:${o.label}`)
				.join(',')}`
		);
	};

	const onLoad = () => {
		let urlParams = new URLSearchParams(window.location.search);
		if (urlParams.has('filters')) {
			let filters = urlParams.get('filters').split(',');
			console.log(filters);
			setOptionsList([
				...optionsList,
				filters.map(e => ({ value: e.split(':')[0], label: e.split(':')[1] })),
			]);
			console.log(optionsList);
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
			<Box width="100%">
				<Button label="Share filters" onClickFn={onShare} />
			</Box>
		</Box>
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
	console.log(
		uData.filter(e =>
			optionsList.every(p =>
				String(e['responsible']).toUpperCase().includes('pepito'.toUpperCase())
			)
		)
	);

	return (
		<DataGrid disableSelectionOnClick={true} rows={shownData} columns={columns} />
	);
}
