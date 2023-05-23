import { Box, Button, Typography } from '@material-ui/core';
import NewDispForm from '../components/DispensationControls/NewDispForm';

export default function DispensationControls() {
	return (
		<Box
			display="flex"
			flexDirection="column"
			alignItems="center"
			justifyContent="center"
			width="100%"
			gridGap={8}
		>
			<Typography variant="h3">
				What would you want to do with dispensations ?
			</Typography>
			<Box display="flex" flexDirection="row" gridGap={8}>
				<Button variant="contained">Add a new record</Button>
				<Button variant="contained">Update an existing record</Button>
			</Box>
			<NewDispForm />
		</Box>
	);
}
