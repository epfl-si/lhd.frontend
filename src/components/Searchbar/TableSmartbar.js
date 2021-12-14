import { Box, MenuItem, TextField } from '@material-ui/core';
import { useEffect, useRef, useState } from 'react';
import AppSearchbarAuto from './SmartbarAuto';
import { columns } from '../appTable';
import SmartbarManual from './SmartbarManual';
import { Button } from '@epfl/epfl-sti-react-library';
import { Close } from '@mui/icons-material';

export default function TableSmartbar({
	paramsData,
	optionsList,
	setOptionsList,
	tableData,
}) {
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

		setOptionsList([
			...optionsList,
			{
				label: category,
				value: statement.value,
			},
		]);
		setCategory(null);

		statement.value = '';
	};

	const onDeleteCategories = () => {
		setCategory(null);
	};

	useEffect(() => {
		setSearchOptions(
			columns.filter(e => optionsList.every(p => p.label !== e.field))
		);
		setCategory(null);
	}, [optionsList]);
	return (
		<Box
			display="flex"
			flexDirection={{ xs: 'column', sm: 'row' }}
			justifyContent="start"
			alignItems={{ xs: 'start', sm: 'center' }}
			paddingY={2}
			gridGap={8}
		>
			{category !== null && (
				<Button label={<Close />} onClickFn={onDeleteCategories} />
			)}
			<TextField
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

			{category === null ? (
				<AppSearchbarAuto
					optionsList={optionsList}
					setOptionsList={setOptionsList}
					tableData={tableData}
				/>
			) : (
				<Box width="100%">
					<SmartbarManual inputRef={statementRef} onSearch={onSearch} />
				</Box>
			)}
			{/* <AppParamsList
				paramsData={paramsData}
				setParamsData={setParamsData}
				setSearchOptions={setSearchOptions}
			/> */}
		</Box>
	);
}
