import { Box, TextField } from '@material-ui/core';
import { Autocomplete } from '@mui/material';
import { useState } from 'react';

export default function AppSearchbarAuto({ tableData }) {
	const [statement, setStatement] = useState('');
	console.log(tableData);
	const [optionsList, setOptionsList] = useState([]);

	const handleStatementChange = event => {
		setStatement(event.target.value);
	};

	const handleListChange = (event, value) => {
		setOptionsList(value);
	};

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
				fullWidth
				value={optionsList}
				onChange={handleListChange}
				options={(tableData || []).sort((a, b) => -b.label.localeCompare(a.label))}
				groupBy={option => option.label}
				getOptionLabel={option => option.value}
				renderInput={params => (
					<TextField
						{...params}
						value={statement}
						fullWidth
						onChange={handleStatementChange}
						label="Search entries"
						placeholder="Entries"
						variant="outlined"
					/>
				)}
			/>
		</Box>
	);
}
