import {DatePicker, LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import Textarea from '@mui/joy/Textarea';
import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	FormControl,
	FormLabel,
	InputLabel,
	MenuItem,
	Select,
	TextField,
} from '@material-ui/core';
import {Autocomplete, Stack} from '@mui/material';
import {Controller, useForm} from 'react-hook-form';
import {State, useOpenIDConnectContext} from '@epfl-si/react-appauth';
import {deleteDispensation, updateDispensation,} from '../../utils/graphql/PostingTools';
import {dispensationRequestType, notificationType,} from '../../utils/ressources/types';
import {env} from '../../utils/env';
import {useEffect, useState} from 'react';
import Notifications from '../Table/Notifications';
import {notificationsVariants} from '../../utils/ressources/variants';
import {fetchDispFormDetails, fetchSingleDispensation, fetchSlugs,} from '../../utils/graphql/FetchingTools';
import dayjs from 'dayjs';
import {getErrorMessage} from "../../utils/graphql/Utils";

export default function UpdateDispForm() {
	const [roomData, setRoomData] = useState<any>([]);
	const [holderData, setHolderData] = useState<any>([]);
	const oidc: State = useOpenIDConnectContext();
	const { register, handleSubmit, control, setValue } = useForm();

	const [data, setData] = useState<any>([]);
	const [dialogOpen, setDialogOpen] = useState<boolean>(false);
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
			const resultsDetails = await fetchDispFormDetails(
				env().REACT_APP_GRAPHQL_ENDPOINT_URL,
				oidc.accessToken,
				{}
			);
			if (results.status === 200 && results.data && typeof results.data !== 'string') {
				setData(
					results.data.map((d: any) => ({
						label: d.slug,
						value: d.slug,
					}))
				);
				setHolderData(
					resultsDetails.data.people.map((d: any) => ({
						label: d.name ? d.name : '',
						value: `${d.sciper}`,
					}))
				);
				setRoomData(
					resultsDetails.data.rooms.map((d: any) => ({
						label: d.name ? d.name : '',
						value: d.name,
					}))
				);
				if (urlParams.get('slug')) {
					setSlug(urlParams.get('slug') as string);
				}
			}else {
				const errors = getErrorMessage(results, 'rooms');
				setNotificationType(errors.notif);
				setOpenNotification(true);
			}
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

	const onDelete = () =>
		deleteDispensation(
			env().REACT_APP_GRAPHQL_ENDPOINT_URL,
			oidc.accessToken,
			slug,
			{}
		).then(res => {
			if (res.status === 200) {
				setDialogOpen(false);
				setNotificationType(notificationsVariants['disp-delete-success']);
				setOpenNotification(true);
				setSlug('');
			}
		});

	const formatData = (data: any): dispensationRequestType => {
		data.startDate = data.startDate.format('YYYY-MM-DD');
		data.endDate = data.endDate.format('YYYY-MM-DD');
		typeof data.rooms === 'string' &&
			(data.rooms = data.rooms
				.split(',')
				.map(e => roomData.find((o: any) => o.value === parseInt(e))));
		typeof data.holders === 'string' &&
			(data.holders = data.holders
				.split(',')
				.map(e => holderData.find((o: any) => o.value === e)));
		data.rooms =
			data.rooms.length > 0
				? `[${data.rooms.map(r => `{ name: "${r.value}" }`).join(', ')}]`
				: null;
		data.holders =
			data.holders.length > 0
				? `[${data.holders.map(h => `{ sciper: "${h.value}" }`).join(', ')}]`
				: null;
		console.log('test', data);
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
						console.log(res.data);
						setSelectedDisp(res.data);
						setSlug(data);
						setValue('subject', res.data.subject);
						setValue('startDate', dayjs(res.data.date_start));
						setValue('endDate', dayjs(res.data.date_end));
						setValue('requirements', res.data.description);
						setValue('comment', res.data.comment);
						setValue('rooms', res.data.rooms.map((d: any) => d.name).join(','));
						setValue(
							'holders',
							res.data.holders.map((d: any) => d.sciper).join(',')
						);
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
						<Controller
							control={control}
							name="rooms"
							render={({ field }) => {
								const { onChange, onBlur, value } = field;
								return (
									<Autocomplete
										multiple
										limitTags={6}
										options={roomData}
										filterSelectedOptions
										style={{ minWidth: '350px', maxWidth: '30%' }}
										renderInput={params => (
											<TextField
												{...params}
												variant="outlined"
												label="Rooms"
												placeholder="Search"
											/>
										)}
										onChange={(event, selectedOptions) => {
											console.log(selectedOptions);
											onChange(selectedOptions);
										}}
										onBlur={onBlur}
										value={
											typeof value === 'string'
												? value
														.split(',')
														.map(e =>
															roomData.find((o: any) => o.value === e)
														)
												: value || []
										}
									/>
								);
							}}
						/>
						<Controller
							control={control}
							name="holders"
							render={({ field }) => {
								const { onChange, onBlur, value } = field;
								return (
									<Autocomplete
										multiple
										limitTags={3}
										options={holderData}
										filterSelectedOptions
										style={{ minWidth: '350px', maxWidth: '30%' }}
										renderInput={params => (
											<TextField
												{...params}
												variant="outlined"
												label="Holders"
												placeholder="Search"
											/>
										)}
										onChange={(event, selectedOptions) => {
											onChange(selectedOptions);
										}}
										onBlur={onBlur}
										value={
											typeof value === 'string'
												? value
														.split(',')
														.map(e => holderData.find((o: any) => o.value === e))
												: value || []
										}
									/>
								);
							}}
						/>
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
						<Box
							width="100%"
							display="flex"
							flexDirection="row"
							justifyContent="center"
							gridGap={8}
						>
							<Button color="primary" onClick={handleSubmit(onUpdate)}>
								Update
							</Button>
							<Button color="secondary" onClick={() => setDialogOpen(true)}>
								Delete
							</Button>
						</Box>
					</>
				)}
			</Stack>
			<Notifications
				open={openNotification}
				notification={notificationType}
				close={handleClose}
			/>
			<Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
				<DialogTitle>
					Are you sure you want to delete dispensation {slug}?
				</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Deleting a dispensation is irreversible.
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button color="primary" onClick={() => setDialogOpen(false)}>
						No
					</Button>
					<Button color="secondary" onClick={handleSubmit(onDelete)} autoFocus>
						Yes, I'm sure
					</Button>
				</DialogActions>
			</Dialog>
		</form>
	);
}
