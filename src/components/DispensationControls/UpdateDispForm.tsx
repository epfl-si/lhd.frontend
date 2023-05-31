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
	TextField,
} from '@material-ui/core';
import { Autocomplete, Stack } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import {
	createDispensation,
	updateDispensation,
} from '../../utils/graphql/PostingTools';
import { State, useOpenIDConnectContext } from '@epfl-si/react-appauth';
import {
	dispensationRequestType,
	notificationType,
} from '../../utils/ressources/types';
import { env } from '../../utils/env';
import { useEffect, useState } from 'react';
import Notifications from '../Table/Notifications';
import { notificationsVariants } from '../../utils/ressources/variants';
import {
	fetchSingleDispensation,
	fetchSlugs,
} from '../../utils/graphql/FetchingTools';
import dayjs, { Dayjs } from 'dayjs';

export default function UpdateDispForm() {
	const oidc: State = useOpenIDConnectContext();
	const { register, handleSubmit, control, setValue } = useForm();

	const [data, setData] = useState<any>([]);
	const [notificationType, setNotificationType] = useState<notificationType>({
		type: '',
		text: '',
	});
	const [openNotification, setOpenNotification] = useState<boolean>(false);
	const [selectedDisp, setSelectedDisp] = useState<Object | null>(null);
	const [slug, setSlug] = useState<string>('');

	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const loadFetch = async () => {
			const results = await fetchSlugs(
				env().REACT_APP_GRAPHQL_ENDPOINT_URL,
				oidc.accessToken,
				{}
			);
			if (results.status === 200) {
				if (results.data) {
					if (typeof results.data !== 'string') {
						setData(
							results.data.map((d: any) => ({
								label: d.slug,
								value: d.slug,
							}))
						);
						if (urlParams.get('slug')) {
							setSlug(urlParams.get('slug') as string);
						}
					}
					console.error('Bad GraphQL results', results);
				} else {
				}
			}
			console.log(results);
		};
		loadFetch();
	}, [oidc.accessToken]);
	const handleClose = (event: Event, reason: string) => {
		if (reason === 'clickaway') return;
		setOpenNotification(false);
	};

	const onUpdate = (data: any) =>
		updateDispensation(
			env().REACT_APP_GRAPHQL_ENDPOINT_URL,
			oidc.accessToken,
			slug,
			formatData(data),
			{}
		).then(res => {
			if (res.status === 200) {
				setNotificationType(notificationsVariants['disp-update-success']);
				setOpenNotification(true);
			}
		});

	const formatData = (data: any): dispensationRequestType => {
		data.startDate = data.startDate.format('YYYY-MM-DD');
		data.endDate = data.endDate.format('YYYY-MM-DD');
		return data;
	};

	const getDispensation = (data: any) => {
		fetchSingleDispensation(
			env().REACT_APP_GRAPHQL_ENDPOINT_URL,
			oidc.accessToken,
			data,
			{}
		).then(res => {
			if (res.status === 200) {
				if (res.data) {
					if (typeof res.data !== 'string') {
						setSelectedDisp(res.data);
						setSlug(data);
						setValue('subject', res.data.subject);
						setValue('startDate', dayjs(res.data.date_start));
						setValue('endDate', dayjs(res.data.date_end));
						setValue('requirements', res.data.description);
						setValue('comment', res.data.comment);
					}
				} else {
				}
			}
		});
	};

	return (
		<form style={{ width: '100%' }}>
			<Stack spacing={2} width="100%">
				<FormControl style={{ maxWidth: '250px' }}>
					<Autocomplete
						disablePortal
						options={data}
						style={{ width: 300 }}
						value={slug}
						renderInput={params => (
							<TextField
								{...params}
								variant="outlined"
								label="Search dispensation"
							/>
						)}
						onInputChange={(event, value) => {
							if (value === '') {
								control.unregister();
								setSelectedDisp(null);
								setSlug('');
								return;
							}
							getDispensation(value);
						}}
					/>
				</FormControl>
				{selectedDisp !== null && (
					<>
						<FormControl style={{ maxWidth: '250px' }}>
							<InputLabel variant="outlined">Subject</InputLabel>
							<Controller
								control={control}
								name="subject"
								defaultValue={selectedDisp.subject}
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
								defaultValue={dayjs(selectedDisp.date_start)}
								render={({ field }) => (
									<DatePicker
										label="Start Date"
										{...field}
										sx={{ maxWidth: '250px' }}
									/>
								)}
							/>
							<Controller
								control={control}
								name="endDate"
								defaultValue={dayjs(selectedDisp.date_end)}
								render={({ field }) => (
									<DatePicker
										label="End Date"
										{...field}
										sx={{ maxWidth: '250px' }}
									/>
								)}
							/>
						</LocalizationProvider>
						<FormControl style={{ minWidth: '350px', maxWidth: '30%' }}>
							<FormLabel>Requirements</FormLabel>
							<Controller
								control={control}
								name="requirements"
								defaultValue={selectedDisp.description}
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
								defaultValue={selectedDisp.comment}
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
						<Button onClick={handleSubmit(onUpdate)}>Update</Button>
					</>
				)}
			</Stack>
			<Notifications
				open={openNotification}
				notification={notificationType}
				close={handleClose}
			/>
		</form>
	);
}
