import { LoginButton, State, useOpenIDConnectContext } from '@epfl-si/react-appauth';
import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
} from '@material-ui/core';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchResults } from '../../utils/graphql/FetchingTools';
import {
	generateAutocompleteList,
	generateColumns,
	generateFormattedList,
	getTypeQuery,
	parse,
} from '../../utils/graphql/ParsingTools';
import { copyLinkParams, setUrlParams } from '../../utils/web/URLUtils';
import ControlsBar from '../global/ControlsBar';
import TableSmartbar from '../Searchbar/TableSmartbar';
import { EntriesTableCategory } from './EntriesTableCategory';
import Notifications from './Notifications';
import { env } from '../../utils/env';
import { Alert } from '@mui/material';
import LanguageSwitcher from './LanguageSwitcher';
import {
	columnType,
	notificationType,
	parameterType,
} from '../../utils/ressources/types';
import { notificationsVariants } from '../../utils/ressources/variants';

type AppTableProps = {
	graphqlBody: string;
	variables: object;
};

export function AppTable({ graphqlBody, variables }: AppTableProps) {
	const { t } = useTranslation();
	const oidc: State = useOpenIDConnectContext();

	const columns: columnType[] = generateColumns(
		graphqlBody,
		getTypeQuery(graphqlBody)
	);

	const [tableData, setTableData] = useState<Object[]>([]);
	const [optionsList, setOptionsList] = useState<parameterType[]>([]);
	const [autoComplete, setAutoComplete] = useState<parameterType[]>([]);
	const [openNotification, setOpenNotification] = useState<boolean>(false);
	const [notificationType, setNotificationType] = useState<notificationType>({
		type: '',
		text: '',
	});
	const [dataError, setDataError] = useState({
		active: false,
		status: 0,
		message: 'null',
	});
	const [loading, setLoading] = useState(false);

	const handleClose = (event: Event, reason: string) => {
		if (reason === 'clickaway') return;
		setOpenNotification(false);
	};

	const onShare = () => {
		copyLinkParams(optionsList);
		setNotificationType(
			optionsList?.length > 0
				? notificationsVariants['copy-success']
				: notificationsVariants['copy-error']
		);
		setOpenNotification(true);
	};

	useEffect(() => {
		const onLoad = () => {
			const paramsList = generateFormattedList(parse(graphqlBody), 'room.');
			const urlParams = new URLSearchParams(window.location.search);
			if (urlParams.has('filters')) {
				let filters = urlParams?.get('filters')?.split(',');
				if (filters?.every(e => paramsList.includes(e.split(':')[1]))) {
					setOptionsList(
						filters?.map(e => ({ value: e?.split(':')[0], label: e?.split(':')[1] }))
					);
				} else {
					setNotificationType(notificationsVariants['params-error']);
					setOpenNotification(true);
				}
			}
		};

		onLoad();

		async function reloadResults() {
			setLoading(true);
			const results = await fetchResults(
				env().REACT_APP_GRAPHQL_ENDPOINT_URL,
				oidc.accessToken,
				graphqlBody,
				variables
			);
			setLoading(false);

			if (results.status === 200) {
				if (results.data) {
					// Only setTableData if results.data is not a string
					if (typeof results.data !== 'string') {
						setTableData(results.data);
					}
				} else {
					console.error('Bad GraphQL results', results);
				}
			} else {
				setDataError({
					active: true,
					message: results.data,
					status: results.status,
				});
			}
		}

		reloadResults();
	}, [graphqlBody, oidc.accessToken, variables]);

	useEffect(() => {
		setUrlParams(optionsList);
	}, [optionsList]);

	useEffect(() => {
		if (!tableData) return;
		setAutoComplete(generateAutocompleteList(tableData));
	}, [tableData]);

	return (
		<Box display="flex" flexDirection="column" alignItems="center">
			{!dataError.active ? (
				<>
					<ControlsBar />
					<TableSmartbar
						optionsList={optionsList}
						setOptionsList={setOptionsList}
						tableData={autoComplete}
						columns={columns}
					/>
					<EntriesTableCategory
						optionsList={optionsList}
						tableData={tableData}
						columns={columns}
						loading={loading}
					/>
					<Box width="100%" paddingY="16px">
						<Button onClick={onShare} variant="outlined">
							{t('copy.params')}
						</Button>
					</Box>
					<Notifications
						open={openNotification}
						notification={notificationType}
						close={handleClose}
					/>
				</>
			) : (
				<Dialog open={true}>
					<Alert severity="error">
						<b>{t(`fetchError.header`)}</b>
					</Alert>
					<LanguageSwitcher />
					<DialogTitle>{`${dataError.status} ${t(
						`fetchError.code.${dataError.status}.title`
					)}`}</DialogTitle>
					<DialogContent>
						{t(`fetchError.code.${dataError.status}.content`)}
						<Box
							component="div"
							style={{
								whiteSpace: 'normal',
								my: 2,
								p: 1,
								bgcolor: 'black',
								opacity: 0.8,
								color: 'white',
								border: '1px solid',
								borderColor: 'grey.300',
								borderRadius: 5,
								fontSize: '0.875rem',
								fontWeight: '700',
							}}
						>
							<Box
								sx={{
									color: 'red',
								}}
							>
								{t(`fetchError.serverMessage`)}
							</Box>
							{dataError.message}
						</Box>
					</DialogContent>
					<DialogActions>
						<LoginButton />
					</DialogActions>
				</Dialog>
			)}
		</Box>
	);
}
