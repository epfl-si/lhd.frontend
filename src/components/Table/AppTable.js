import { Box, Button } from '@material-ui/core';
import { useKeycloak } from '@react-keycloak/web';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { fetchResults } from '../../utils/graphql/FetchingTools';
import {
	generateAutocompleteList,
	generateColumns,
	generateFormattedList,
	getTypeQuery,
	parse,
} from '../../utils/graphql/ParsingTools';
import { notificationsTypes } from '../../utils/ressources/Types';
import { copyLinkParams } from '../../utils/web/URLUtils';
import TableSmartbar from '../Searchbar/TableSmartbar';
import { EntriesTableCategory } from './EntriesTableCategory';
import LanguageSwitcher from './LanguageSwitcher';
import Notifications from './Notifications';

export function AppTable({ graphqlBody, variables }) {
	const { t } = useTranslation();
	const { keycloak } = useKeycloak();
	const isLoggedIn = keycloak.authenticated;

	const columns = generateColumns(graphqlBody, getTypeQuery(graphqlBody), 'en');

	const [tableData, setTableData] = useState([]);
	const [paramsData, setParamsData] = useState([]);
	const [optionsList, setOptionsList] = useState([]);
	const [autoComplete, setAutoComplete] = useState([]);
	const [openNotification, setOpenNotification] = useState(false);
	const [notificationType, setNotificationType] = useState('');
	const history = useHistory();

	const handleClose = (event, reason) => {
		if (reason === 'clickaway') return;
		setOpenNotification(false);
	};

	const onShare = () => {
		copyLinkParams(optionsList);
		setNotificationType(
			optionsList?.length > 0
				? notificationsTypes['copy-success']
				: notificationsTypes['copy-error']
		);
		setOpenNotification(true);
	};

	useEffect(() => {
		const onLoad = () => {
			const paramsList = generateFormattedList(parse(graphqlBody), 'room.');
			const urlParams = new URLSearchParams(window.location.search);
			if (urlParams.has('filters')) {
				let filters = urlParams.get('filters').split(',');
				if (filters.every(e => paramsList.includes(e.split(':')[1]))) {
					setOptionsList(
						filters.map(e => ({ value: e.split(':')[0], label: e.split(':')[1] }))
					);
				} else {
					setNotificationType(notificationsTypes['params-error']);
					setOpenNotification(true);
				}
			}
			fetchResults('//localhost:3001', keycloak.token, graphqlBody, variables);
		};

		onLoad();

		async function reloadResults() {
			setTableData(
				await fetchResults(
					'//localhost:3001',
					keycloak.token,
					graphqlBody,
					variables
				)
			);
		}

		reloadResults();
	}, [graphqlBody, keycloak.token, variables]);

	useEffect(() => {
		history.replace(
			optionsList.length > 0
				? `/?filters=${optionsList.map(o => `${o.value}:${o.label}`).join(',')}`
				: ''
		);
	}, [history, optionsList]);

	useEffect(() => {
		if (!tableData) return;
		setAutoComplete(generateAutocompleteList(tableData));
	}, [tableData]);

	return (
		<Box display="flex" flexDirection="column" alignItems="center">
			<LanguageSwitcher />
			{isLoggedIn && (
				<Button variant="outlined" onClick={() => keycloak.logout()}>
					{t('logout')}
				</Button>
			)}
			<TableSmartbar
				searchCategories={columns}
				paramsData={paramsData}
				setParamsData={setParamsData}
				optionsList={optionsList}
				setOptionsList={setOptionsList}
				tableData={autoComplete}
				columns={columns}
			/>
			<EntriesTableCategory
				optionsList={optionsList}
				tableData={tableData}
				columns={columns}
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
		</Box>
	);
}
