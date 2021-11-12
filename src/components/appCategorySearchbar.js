import { Button } from '@epfl/epfl-sti-react-library';
import { Box, InputAdornment, MenuItem, TextField } from '@material-ui/core';

export default function AppCategorySearchbar(props) {
	const {
		searchCategories,
		categoryValue,
		statementValue,
		onStateChange,
		onCatChange,
		onSearch,
		onClear,
	} = props;
	const categories = searchCategories.map(e => ({
		value: e.field,
		label: e.headerName,
	}));
	return (
		<Box
			display="flex"
			flexDirection="row"
			justifyContent="start"
			alignItems="center"
			gridGap={8}
		>
			<TextField
				id="outlined-select-currency"
				select
				style={{
					minWidth: '200px',
				}}
				label="Select category"
				value={categoryValue}
				onChange={onCatChange}
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
				label="Search entries"
				variant="outlined"
				value={statementValue}
				onChange={onStateChange}
				InputProps={{
					startAdornment: (
						<InputAdornment position="start">{categoryValue}</InputAdornment>
					),
				}}
			></TextField>
			<Button label="Search" onClickFn={onSearch} />
			{statementValue !== '' && <Button label="✖︎" onClickFn={onClear} />}
		</Box>
	);
}
