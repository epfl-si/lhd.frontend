import { Button } from '@epfl/epfl-sti-react-library';
import { Box, MenuItem, TextField } from '@material-ui/core';
import { Search, DeleteForever } from '@mui/icons-material';

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
			flexDirection={{ xs: 'column', sm: 'row' }}
			justifyContent="start"
			alignItems={{ xs: 'start', sm: 'center' }}
			paddingY={2}
			gridGap={8}
		>
			<TextField
				id="outlined-select-currency"
				select
				fullWidth={{ xs: true, sm: false }}
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
			></TextField>

			<Box
				width="100%"
				display="flex"
				flexDirection="row"
				justifyContent={{ xs: 'space-between', sm: 'start' }}
				gridGap={8}
			>
				<Button label={<Search />} onClickFn={onSearch} />
				{statementValue !== '' && (
					<Button label={<DeleteForever />} onClickFn={onClear} />
				)}
			</Box>
		</Box>
	);
}
