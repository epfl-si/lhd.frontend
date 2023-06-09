import { Box, IconButton, MenuItem, TextField } from '@material-ui/core';
import { useEffect, useRef, useState } from 'react';
import AppSearchbarAuto from './SmartbarAuto';
import SmartbarManual from './SmartbarManual';
import { Close } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

export default function TableSmartbar({
	optionsList,
	setOptionsList,
	tableData,
	columns,
}) {
	const { t } = useTranslation();
	const [searchOptions, setSearchOptions] = useState(columns);
	const [category, setCategory] = useState('');
	const statementRef = useRef();

	const categories = searchOptions.map(e => ({
		value: e.field,
		label: e.headerName,
	}));

	const handleCategoryChange = event => {
		setCategory(event.target.value);
	};

	const onSearch = () => {
		// ! Renders twice after a search, need to refactor that
		const statement = statementRef.current;
		if (!statement) return;

		setOptionsList([
			...optionsList,
			{
				label: category,
				value: statement.value,
			},
		]);
		setCategory('');

		statement.value = '';
	};

	const onDeleteCategories = () => {
		setCategory('');
	};

	useEffect(() => {
		setSearchOptions(
			columns.filter(e => optionsList.every(p => p.label !== e.field))
		);
		setCategory('');
	}, [optionsList, columns]);

	return (
		<Box
			display="flex"
			flexDirection={{ xs: 'column', sm: 'row' }}
			justifyContent="start"
			alignItems={{ xs: 'start', sm: 'center' }}
			paddingBottom={2}
			gridGap={8}
			width="100%"
		>
			<TextField
				select={true}
				disabled={searchOptions.length < 1 ? true : false}
				// ! normally equals { xs: true, sm: false } but causes warnings. Will fix later.
				fullWidth={true}
				style={{
					minWidth: '200px',
				}}
				label={t('searchbar.category')}
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
			{/* Make this into one component (single searchbar) when finding a solution */}
			{category === '' ? (
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
			{category !== '' && (
				<IconButton
					aria-label="delete"
					size="small"
					color="primary"
					onClick={onDeleteCategories}
				>
					<Close fontSize="small" />
				</IconButton>
			)}
		</Box>
	);
}
