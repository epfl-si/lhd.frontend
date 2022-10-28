import Button from '@epfl/epfl-sti-react-library/dist/Forms/Button';
import { Box, Snackbar } from '@material-ui/core';
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
import { useHistory } from 'react-router-dom';
import {
	generateColumns,
	generateFormattedList,
	getTypeQuery,
	parse,
} from '../utils/queryparsing/graphqltools';
import TableSmartbar from './Searchbar/TableSmartbar';

export function AppTable({ graphqlBody, variables }) {
	const notifTypes = [
		{
			type: 'success',
			text: 'Successfully copied link w/ parameters to clipboard !',
		},
		{ type: 'error', text: 'You have no query filters to share !' },
	];

	const columns = generateColumns(graphqlBody, getTypeQuery(graphqlBody), 'en');

	const [columnsTest, setColumnsTest] = useState(null);
	const [tableData, setTableData] = useState(null);
	const [paramsData, setParamsData] = useState([]);
	const [optionsList, setOptionsList] = useState([]);
	const [autoComplete, setAutoComplete] = useState();
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

	// ? I have no idea how to make this reusable, I'll have to ask for help
	const fetchResults = async () => {
		const operationName = 'AppTableFetch';
		const results = await fetch('//localhost:3001/', {
			headers: {
				accept: '*/*',
				'accept-language': 'en-US,en;q=0.9,fr-CH;q=0.8,fr;q=0.7',
				'content-type': 'application/json',
				'sec-ch-ua':
					'" Not A;Brand";v="99", "Chromium";v="98", "Google Chrome";v="98"',
				'sec-ch-ua-mobile': '?0',
				'sec-ch-ua-platform': '"macOS"',
				'sec-fetch-dest': 'empty',
				'sec-fetch-mode': 'cors',
				'sec-fetch-site': 'cross-site',
				authorization: `Bearer ${keycloak.token}`,
			},
			referrerPolicy: 'no-referrer-when-downgrade',
			body: JSON.stringify({
				query: `query ${operationName} { ${graphqlBody} }`,
				variables,
			}),
			method: 'POST',
			mode: 'cors',
			credentials: 'omit',
		});
		const graphQLResponse = await results.json();

		return graphQLResponse.data?.rooms.map((room, index) => {
			var tempObj = { id: index };
			const recursiveParse = (data, keys) => {
				if (keys.length === 1) {
					return data[keys[0]] ? data[keys[0]] : null;
				} else {
					return data[keys[0]]
						? recursiveParse(
								data[keys[0]][0] ? data[keys[0]][0] : data[keys[0]],
								keys.slice(1)
						  )
						: null;
				}
			};

			generateFormattedList(parse(graphqlBody)).forEach(item => {
				var splitKey = item.split('.');
				if (splitKey.length === 1) {
					tempObj[`${getTypeQuery(graphqlBody)}.${item}`] = room[splitKey[0]]
						? room[splitKey[0]]
						: null;
				} else {
					tempObj[`${getTypeQuery(graphqlBody)}.${item}`] = room[splitKey[0]]
						? recursiveParse(
								room[splitKey[0]][0] ? room[splitKey[0]][0] : room[splitKey[0]],
								splitKey.slice(1)
						  )
						: null;
				}
			});

			return tempObj;
		});
	};

	const onLoad = () => {
		// TODO: Will need to put a params checker (returns an error snackbar if url param does not exist).
		let urlParams = new URLSearchParams(window.location.search);
		if (urlParams.has('filters')) {
			let filters = urlParams.get('filters').split(',');
			setOptionsList(
				filters.map(e => ({ value: e.split(':')[0], label: e.split(':')[1] }))
			);
		}
		fetchResults();
	};

	useEffect(() => {
		onLoad();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		history.replace(
			optionsList.length > 0
				? `/?filters=${optionsList.map(o => `${o.value}:${o.label}`).join(',')}`
				: ''
		);
	}, [history, optionsList]);

	// ! fix eslint error.
	// eslint-disable-next-line react-hooks/exhaustive-deps
	async function reloadResults(filter) {
		setTableData(await fetchResults(filter));
		// generate a list of columns from tableData
		setColumnsTest(
			Object.keys(tableData[0]).map(key => ({
				field: key,
				headerName: key,
				width: 130,
			}))
		);
		console.log(columnsTest);
		console.log(tableData);
	}

	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(reloadResults, []);

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

	const Throbber = () => <p>This space unintentionnally left unblank</p>;

	const { keycloak } = useKeycloak();

	const isLoggedIn = keycloak.authenticated;

	return (
		<Box display="flex" flexDirection="column" alignItems="center">
			{isLoggedIn && <Button label="Log out" onClickFn={() => keycloak.logout()} />}
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
				<Button label="Copy link w/ parameters" onClickFn={onShare} />
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
