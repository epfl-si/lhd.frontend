import { Box, Chip, TextField } from '@material-ui/core';
import { Autocomplete } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function SmartbarAuto({ tableData, optionsList, setOptionsList }) {
	const { t } = useTranslation();
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
				fullWidth={true}
				value={optionsList}
				onChange={handleListChange}
				options={(tableData || []).sort((a, b) => -b.label.localeCompare(a.label))}
				groupBy={option => t(option.label)}
				getOptionLabel={option => option.value}
				renderTags={(value, getTagProps) =>
					value.map((option, index) => (
						<Chip
							variant="outlined"
							label={
								<div>
									<b>{t(option.label)} |</b> {option.value}
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
						fullWidth={true}
						onChange={handleStatementChange}
						label={t('searchbar.entries.label')}
						placeholder={t('searchbar.entries.placeholder')}
						variant="outlined"
					/>
				)}
			/>
		</Box>
	);
}
