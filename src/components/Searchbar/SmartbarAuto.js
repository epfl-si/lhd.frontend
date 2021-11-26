import { Box, Chip, TextField } from '@material-ui/core';
import { Autocomplete } from '@mui/material';
import { useState } from 'react';

export default function SmartbarAuto({ tableData, optionsList, setOptionsList }) {
	const [statement, setStatement] = useState('');

	const handleStatementChange = event => {
		setStatement(event.target.value);
	};

	const handleListChange = (event, value) => {
		setOptionsList(value);
	};

	return (
		<Box
			display="flex"
			width="100%"
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
				renderTags={(value, getTagProps) =>
					value.map((option, index) => (
						<Chip
							variant="outlined"
							label={
								<div>
									<b>{option.label} |</b> {option.value}
								</div>
							}
							{...getTagProps({ index })}
						/>
					))
				}
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
