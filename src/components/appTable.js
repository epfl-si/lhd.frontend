import { Box, Switch } from '@material-ui/core';
import { DataGrid } from '@mui/x-data-grid';
import { useState, useMemo, useEffect } from 'react';
import uData from '../json/example.json';
import AppCategorySearchbar from './appCategorySearchbar';
import AppSearchbarAuto from './appSearchbarAuto';

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
	const [checked, setChecked] = useState(true);
	const [autoComplete, setAutoComplete] = useState();

	const handleChange = event => {
		setChecked(event.target.checked);
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
	}, []);

	return (
		<Box display="flex" flexDirection="column" alignItems="center">
			<Switch
				checked={checked}
				onChange={handleChange}
				inputProps={{ 'aria-label': 'controlled' }}
			/>
			<Box width="100%">
				{checked ? (
					<AppSearchbarAuto
						optionsList={optionsList}
						setOptionsList={setOptionsList}
						tableData={autoComplete}
					/>
				) : (
					<AppCategorySearchbar
						searchCategories={columns}
						paramsData={paramsData}
						setParamsData={setParamsData}
					/>
				)}
			</Box>
			<Box width="100%" height="500px">
				<EntriesTableCategory
					paramsData={paramsData}
					optionsList={optionsList}
					checked={checked}
				/>
			</Box>
		</Box>
	);
}

function EntriesTableCategory({ paramsData, optionsList, checked }) {
	const shownData = useMemo(
		() =>
			paramsData?.length === 0
				? uData
				: uData.filter(e =>
						paramsData.every(p =>
							String(e[p.param]).toUpperCase().includes(p.label.toUpperCase())
						)
				  ),
		[paramsData]
	);
	const shownDataAuto = useMemo(
		() =>
			optionsList?.length === 0
				? uData
				: uData.filter(e =>
						optionsList.every(
							p => String(e[p.label]).toUpperCase() === p.value.toUpperCase()
						)
				  ),
		[optionsList]
	);

	return (
		<DataGrid
			disableSelectionOnClick={true}
			rows={checked ? shownDataAuto : shownData}
			columns={columns}
		/>
	);
}
