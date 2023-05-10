import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Box,
	Card,
	CardContent,
	Typography,
} from '@material-ui/core';
import { Stack } from '@mui/material';
import React from 'react';
import DetailRow from '../components/RoomDetails/DetailRow.tsx';
import DetailDrawer from '../components/RoomDetails/DetailDrawer.tsx';

export default function RoomDetails() {
	return (
		<Box
			display="flex"
			justifyContent="center"
			alignItems="center"
			flexDirection="column"
			gridGap={16}
		>
			<Typography variant="h3">Details on room ...</Typography>
			<Card style={{ minWidth: 500 }}>
				<CardContent>
					<Typography variant="caption">Basic information on room</Typography>
					<Stack>
						<DetailRow title="Designation" value="none" />
						<DetailRow title="Cosec" value="none" />
						<DetailRow title="Professor/Responsible" value="none" />
						<DetailRow title="Unit" value="none" />
						<DetailRow title="Number of audits per year" value="none" />
					</Stack>
				</CardContent>
			</Card>
			<Box width="100%">
				<DetailDrawer title="Audit Reports">none</DetailDrawer>
				<DetailDrawer title="Hazards">none</DetailDrawer>
				<DetailDrawer title="Authorisations">none</DetailDrawer>
				<DetailDrawer title="Dispensations">none</DetailDrawer>
				<DetailDrawer title="Cadastre">none</DetailDrawer>
				<DetailDrawer title="Supplies interruptions">none</DetailDrawer>
			</Box>
		</Box>
	);
}
