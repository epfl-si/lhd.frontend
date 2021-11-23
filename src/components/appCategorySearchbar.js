import { Button } from '@epfl/epfl-sti-react-library';
import { Box, MenuItem, TextField } from '@material-ui/core';
import { Search } from '@mui/icons-material';
import { useEffect, useRef, useState } from 'react';
import AppParamsList from './appParamsList';
import { columns } from './appTable';

export default function AppCategorySearchbar({ paramsData, setParamsData }) {
	const [searchOptions, setSearchOptions] = useState(columns);
	const [category, setCategory] = useState(null);
	const statementRef = useRef();

	const categories = searchOptions.map(e => ({
		value: e.field,
		label: e.headerName,
	}));

	const handleCategoryChange = event => {
		setCategory(event.target.value);
	};

	const onSearch = () => {
		const statement = statementRef.current;
		if (!statement) return;

		setParamsData([
			...paramsData,
			{
				param: category,
				label: statement.value,
			},
		]);

		statement.value = '';
	};

	useEffect(() => {
		setSearchOptions(
			columns.filter(e => paramsData.every(p => p.param !== e.field))
		);
		setCategory(null);
	}, [paramsData]);
	return (
		<Box
			display="flex"
			flexDirection={{ xs: 'column', sm: 'row' }}
			justifyContent="start"
			alignItems={{ xs: 'start', sm: 'center' }}
			paddingY={2}
			gridGap={8}
		>
			<TextField
				id="outlined-select-currency"
				select
				disabled={searchOptions.length < 1 ? true : false}
				fullWidth={{ xs: true, sm: false }}
				style={{
					minWidth: '200px',
				}}
				label="Select category"
				value={category}
				onChange={handleCategoryChange}
				variant="outlined"
			>
				{categories.map(option => (
					<MenuItem key={option.value} value={option.value}>
						{option.label}
					</MenuItem>
				))}
			</TextField>
			<TextField
				id="outlined-select-currency"
				fullWidth
				disabled={category === null ? true : false}
				onKeyDown={event => {
					event.key === 'Enter' && onSearch();
				}}
				label="Search entries"
				variant="outlined"
				inputRef={statementRef}
			/>

			<Box
				width="100%"
				display="flex"
				flexDirection="row"
				justifyContent={{ xs: 'space-between', sm: 'start' }}
				gridGap={8}
			>
				<Button label={<Search />} onClickFn={onSearch} />
			</Box>
			<AppParamsList
				paramsData={paramsData}
				setParamsData={setParamsData}
				setSearchOptions={setSearchOptions}
			/>
		</Box>
	);
}
