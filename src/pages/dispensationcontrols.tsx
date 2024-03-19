import { Box, Button, Tab, Tabs, Typography } from '@material-ui/core';
import NewDispForm from '../components/DispensationControls/NewDispForm';
import { useEffect, useState } from 'react';
import UpdateDispForm from '../components/DispensationControls/UpdateDispForm';

interface TabPanelProps {
	children?: React.ReactNode;
	index: number;
	value: number;
}

function TabPanel(props: TabPanelProps) {
	const { children, value, index, ...other } = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`simple-tabpanel-${index}`}
			aria-labelledby={`simple-tab-${index}`}
			{...other}
		>
			{value === index && (
				<Box sx={{ p: 3 }}>
					<Typography>{children}</Typography>
				</Box>
			)}
		</div>
	);
}

function a11yProps(index: number) {
	return {
		id: `simple-tab-${index}`,
		'aria-controls': `simple-tabpanel-${index}`,
	};
}

export default function DispensationControls() {
	const tabs = {
		create: 0,
		update: 1,
	};
	const [value, setValue] = useState(0);

	const handleChange = (event: React.SyntheticEvent, newValue: number) => {
		setValue(newValue);
	};

	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		if (urlParams.get('tab')) {
			setValue(tabs[urlParams.get('tab') as string]);
		}
	});

	return (
		<Box
			display="flex"
			flexDirection="column"
			alignItems="center"
			justifyContent="center"
			width="100%"
			gridGap={8}
		>
			<Typography>
				What would you want to do with dispensations ?
			</Typography>
			<Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
				<Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
					<Tab label="Create Dispensation" {...a11yProps(0)} />
					<Tab label="Update Dispensation" {...a11yProps(1)} />
				</Tabs>
			</Box>
			<TabPanel value={value} index={0}>
				<NewDispForm />
			</TabPanel>
			<TabPanel value={value} index={1}>
				<UpdateDispForm />
			</TabPanel>
		</Box>
	);
}
