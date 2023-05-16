import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Box,
	Typography,
} from '@material-ui/core';
import React from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

type DetailDrawerProps = {
	title: string;
	children?: React.ReactNode;
};

export default function DetailDrawer({ title, children }: DetailDrawerProps) {
	return (
		<Accordion>
			<AccordionSummary expandIcon={<ExpandMoreIcon />}>
				<Typography>{title}</Typography>
			</AccordionSummary>
			<AccordionDetails>
				<Typography
					style={{
						width: '100%',
					}}
				>
					{children}
				</Typography>
			</AccordionDetails>
		</Accordion>
	);
}
