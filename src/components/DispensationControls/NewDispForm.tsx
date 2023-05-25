import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Textarea from '@mui/joy/Textarea';
import {
	Button,
	FormControl,
	FormLabel,
	InputLabel,
	MenuItem,
	Select,
} from '@material-ui/core';
import { Stack } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { createDispensation } from '../../utils/graphql/PostingTools';
import { State, useOpenIDConnectContext } from '@epfl-si/react-appauth';
import {
	dispensationRequestType,
	notificationType,
} from '../../utils/ressources/types';
import { env } from '../../utils/env';
import { useState } from 'react';
import Notifications from '../Table/Notifications';
import { notificationsVariants } from '../../utils/ressources/variants';

export default function NewDispForm() {
	const handleClose = (event: Event, reason: string) => {
		if (reason === 'clickaway') return;
		setOpenNotification(false);
	};
	const [notificationType, setNotificationType] = useState<notificationType>({
		type: '',
		text: '',
	});
	const [openNotification, setOpenNotification] = useState<boolean>(false);
	const [addInfo, setAddInfo] = useState<string>('');
	const { register, handleSubmit, control } = useForm();
	const oidc: State = useOpenIDConnectContext();
	const onSubmit = (data: any) =>
		createDispensation(
			env().REACT_APP_GRAPHQL_ENDPOINT_URL,
			oidc.accessToken,
			formatData(data),
			{}
		).then(res => {
			if (res.status === 200) {
				setAddInfo(res.data.createDispensation.slug);
				setNotificationType(notificationsVariants['disp-success']);
				setOpenNotification(true);
			}
		});

	const formatData = (data: any): dispensationRequestType => {
		data.startDate = data.startDate.format('YYYY-MM-DD');
		data.endDate = data.endDate.format('YYYY-MM-DD');
		return data;
	};

	return (
		<form style={{ width: '100%' }}>
			<Stack spacing={2} width="100%">
				<FormControl style={{ maxWidth: '250px' }}>
					<InputLabel variant="outlined">Subject</InputLabel>
					<Controller
						control={control}
						name="subject"
						render={({ field }) => (
							<Select {...field} required variant="outlined">
								<MenuItem value={'Gas'}>Gas</MenuItem>
								<MenuItem value={'Oxydising Gas'}>Oxydising Gas</MenuItem>
								<MenuItem value={'Inert Gas'}>Inert Gas</MenuItem>
								<MenuItem value={'Flammable Gas'}>Flammable Gas</MenuItem>
								<MenuItem value={'Chemical substances'}>
									Chemical substances
								</MenuItem>
								<MenuItem value={'Chemical waste'}>Chemical waste</MenuItem>
								<MenuItem value={'Chemical paste'}>Chemical paste</MenuItem>
								<MenuItem value={'Chemical otter'}>Chemical otter</MenuItem>
								<MenuItem value={'Chemicals'}>Chemicals</MenuItem>
							</Select>
						)}
					/>
				</FormControl>
				<LocalizationProvider dateAdapter={AdapterDayjs}>
					<Controller
						control={control}
						name="startDate"
						render={({ field }) => (
							<DatePicker label="Start Date" {...field} sx={{ maxWidth: '250px' }} />
						)}
					/>
					<Controller
						control={control}
						name="endDate"
						render={({ field }) => (
							<DatePicker label="End Date" {...field} sx={{ maxWidth: '250px' }} />
						)}
					/>
				</LocalizationProvider>
				<FormControl style={{ minWidth: '350px', maxWidth: '30%' }}>
					<FormLabel>Requirements</FormLabel>
					<Controller
						control={control}
						name="requirements"
						render={({ field }) => (
							<Textarea
								placeholder="Maximum 2000 characters..."
								color="neutral"
								minRows={6}
								size="lg"
								{...field}
							/>
						)}
					/>
				</FormControl>
				<FormControl style={{ minWidth: '350px', maxWidth: '30%' }}>
					<FormLabel>Comment</FormLabel>
					<Controller
						control={control}
						name="comment"
						render={({ field }) => (
							<Textarea
								placeholder="Maximum 2000 characters..."
								color="neutral"
								minRows={6}
								size="lg"
								{...field}
							/>
						)}
					/>
				</FormControl>
				<Button onClick={handleSubmit(onSubmit)}>Submit</Button>
			</Stack>
			<Notifications
				open={openNotification}
				notification={notificationType}
				close={handleClose}
				additionalInfo={addInfo}
			/>
		</form>
	);
}
