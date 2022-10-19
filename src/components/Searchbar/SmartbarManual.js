import { Box, TextField } from '@material-ui/core';
import { Search } from '@mui/icons-material';
import { Button } from '@epfl/epfl-sti-react-library';

export default function SmartbarManual({ inputRef, onSearch }) {
	return (
		<Box
			width="100%"
			display="flex"
			flexDirection="row"
			alignItems="center"
			gridGap={8}
		>
			<TextField
				fullWidth={true}
				onKeyDown={event => {
					event.key === 'Enter' && onSearch();
				}}
				label="Search entries"
				variant="outlined"
				inputRef={inputRef}
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
		</Box>
	);
}
