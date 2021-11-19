import { Box, TextField } from '@material-ui/core';
import { Autocomplete } from '@mui/material';
import { useEffect, useState } from 'react';
import { columns } from './appTable';

export default function AppSearchbarAuto({
	searchCategories,
	paramsData,
	setParamsData,
	tableData,
}) {
	const [statement, setStatement] = useState('');
	// console.log(tableData);
	const opt = tableData.forEach(e =>
		Object.entries(e).map(i => {
			return { value: i[1], label: i[0] };
		})
	);
	console.log(opt);

	const [searchOptions, setSearchOptions] = useState(
		columns.map(e => {
			return {
				text: statement,
				value: e.field,
				label: e.headerName,
			};
		})
	);
	const [optionsList, setOptionsList] = useState([]);

	const handleStatementChange = event => {
		setStatement(event.target.value);
	};

	const handleListChange = (event, value) => {
		setOptionsList(value);
	};

	useEffect(() => {
		setSearchOptions(
			columns.map(e => {
				return {
					text: statement,
					value: e.field,
					label: e.headerName,
				};
			})
		);
		// setParamsData([
		// 	...paramsData,
		// 	optionsList.map(e => {
		// 		let option = e.split(':');
		// 		return {
		// 			param: option[0],
		// 			label: option[1],
		// 		};
		// 	}),
		// ]);
		// console.log(paramsData);
	}, [statement]);
	return (
		<Box
			display="flex"
			flexDirection={{ xs: 'column', sm: 'row' }}
			justifyContent="start"
			alignItems={{ xs: 'start', sm: 'center' }}
			paddingY={2}
			gridGap={8}
		>
			<Autocomplete
				multiple
				value={optionsList}
				onChange={handleListChange}
				fullWidth
				options={searchOptions}
				getOptionLabel={test => test.label}
				//filterSelectedOptions
				renderInput={params => (
					<TextField
						{...params}
						value={statement}
						fullWidth
						onChange={handleStatementChange}
						label="Search entries"
						placeholder="Favorites"
					/>
				)}
			/>
		</Box>
	);
}
