import Button from '@epfl/epfl-sti-react-library/dist/Forms/Button';
import { Box, Snackbar, Switch } from '@material-ui/core';
import { Alert } from '@mui/material';
import {
	DataGrid,
	GridToolbarColumnsButton,
	GridToolbarContainer,
	GridToolbarDensitySelector,
	GridToolbarExport,
} from '@mui/x-data-grid';
import { useKeycloak } from '@react-keycloak/web';
import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { fetchResults } from '../utils/graphql/fetchingtools';
import { generateColumns, getTypeQuery } from '../utils/graphql/parsingtools';
import TableSmartbar from './Searchbar/TableSmartbar';

export function AppTable({ graphqlBody, variables }) {
	const { t, i18n } = useTranslation();

	const { keycloak } = useKeycloak();

	const isLoggedIn = keycloak.authenticated;

	const Throbber = () => <p>This space unintentionnally left unblank</p>;

	const notifTypes = [
		{
			type: 'success',
			text: t('copy.success'),
		},
		{ type: 'error', text: t('copy.error') },
	];

	const columns = generateColumns(graphqlBody, getTypeQuery(graphqlBody), 'en');

	const [tableData, setTableData] = useState([]);
	const [paramsData, setParamsData] = useState([]);
	const [optionsList, setOptionsList] = useState([]);
	const [autoComplete, setAutoComplete] = useState([]);
	const [openNotification, setOpenNotification] = useState(false);
	const [notificationType, setNotificationType] = useState(notifTypes[0]);
	const history = useHistory();

	const handleClose = (event, reason) => {
		if (reason === 'clickaway') {
			return;
		}

		setOpenNotification(false);
	};

	const onShare = () => {
		optionsList?.length > 0 &&
			navigator.clipboard.writeText(
				`${window.location.origin}/?filters=${optionsList
					.map(o => `${o.value}:${o.label}`)
					.join(',')}`
			);

		setNotificationType(optionsList?.length > 0 ? notifTypes[0] : notifTypes[1]);
		setOpenNotification(true);
	};

	useEffect(() => {
		const onLoad = () => {
			// TODO: Will need to put a params checker (returns an error snackbar if url param does not exist).
			let urlParams = new URLSearchParams(window.location.search);
			if (urlParams.has('filters')) {
				let filters = urlParams.get('filters').split(',');
				setOptionsList(
					filters.map(e => ({ value: e.split(':')[0], label: e.split(':')[1] }))
				);
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
		setAutoComplete(
			tableData
				.map(e =>
					Object.entries(e).map(i => {
						const [lab, val] = i;
						return { value: isNaN(val) ? val : String(val), label: lab };
					})
				)
				.flat()
				.filter(e => e.label !== 'id')
				.filter(
					(compVal2, index, self) =>
						index ===
							self.findIndex(compVal1 => compVal1.value === compVal2.value) &&
						compVal2.label !== 'id'
				)
		);
	}, [tableData]);

	return (
		<Box display="flex" flexDirection="column" alignItems="center">
			<Box display="flex" flexDirection="row" alignItems="center">
				EN{' '}
				<Switch
					onChange={event =>
						event.target.checked
							? i18n.changeLanguage('fr')
							: i18n.changeLanguage('en')
					}
				/>{' '}
				FR
			</Box>
			{isLoggedIn && (
				<Button label={t('logout')} onClickFn={() => keycloak.logout()} />
			)}
			<Box width="100%">
				<TableSmartbar
					searchCategories={columns}
					paramsData={paramsData}
					setParamsData={setParamsData}
					optionsList={optionsList}
					setOptionsList={setOptionsList}
					tableData={autoComplete}
					columns={columns}
				/>
			</Box>
			<Box width="100%" height="500px">
				{tableData !== null ? (
					<EntriesTableCategory
						optionsList={optionsList}
						tableData={tableData}
						columns={columns}
					/>
				) : (
					<Throbber />
				)}
			</Box>
			<Box width="100%" paddingY="16px">
				<Button label={t('copy.params')} onClickFn={onShare} />
			</Box>
			<Snackbar
				open={openNotification}
				autoHideDuration={3000}
				onClose={handleClose}
			>
				<Alert
					onClose={handleClose}
					severity={notificationType.type}
					sx={{ width: '100%' }}
				>
					{notificationType.text}
				</Alert>
			</Snackbar>
		</Box>
	);
}

function CustomToolbar() {
	return (
		<GridToolbarContainer>
			<GridToolbarColumnsButton />
			<GridToolbarDensitySelector />
			<GridToolbarExport />
		</GridToolbarContainer>
	);
}

function EntriesTableCategory({ optionsList, tableData, columns }) {
	const shownData = useMemo(
		() =>
			optionsList?.length === 0
				? tableData
				: tableData.filter(e =>
						optionsList.every(p =>
							String(e[p.label]).toUpperCase().includes(p.value.toUpperCase())
						)
				  ),
		[optionsList, tableData]
	);

	return (
		<DataGrid
			disableSelectionOnClick={true}
			rows={shownData}
			columns={columns}
			components={{
				Toolbar: CustomToolbar,
			}}
		/>
	);
}
