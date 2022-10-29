import { Box, IconButton, TextField } from '@material-ui/core';
import { Search } from '@mui/icons-material';

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
				<IconButton
					aria-label="search"
					size="small"
					color="primary"
					onClick={onSearch}
				>
					<Search fontSize="small" />
				</IconButton>
			</Box>
		</Box>
	);
}
