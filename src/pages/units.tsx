import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import React, {useEffect, useState} from "react";
import {fetchSearchHistory, fetchUnits, fetchUnitsFromFullText} from "../utils/graphql/FetchingTools";
import {env} from "../utils/env";
import {Box, Typography} from "@material-ui/core";
import {EntriesTableCategory} from "../components/Table/EntriesTableCategory";
import {columnType, lhdUnitsType, parameterType} from "../utils/ressources/types";
import {useTranslation} from "react-i18next";
import featherIcons from "epfl-elements/dist/icons/feather-sprite.svg";
import { GridRenderCellParams } from "@mui/x-data-grid";
import {DebounceInput} from "epfl-elements-react/src/stories/molecules/inputFields/DebounceInput.tsx";
import {createNewSearchForUser} from "../utils/graphql/PostingTools";

interface UnitControlProps {
	handleCurrentPage: (page: string) => void;
	user: number;
}

export const UnitControl = ({
	handleCurrentPage,
	user
}: UnitControlProps) => {
	const PAGE_SIZE = 100;
	const { t } = useTranslation();
	const oidc = useOpenIDConnectContext();
	const [tableData, setTableData] = useState<lhdUnitsType[]>([]);
	const [loading, setLoading] = useState(false);
	const [search, setSearch] = React.useState('');
	const [page, setPage] = useState<number>(0);
	const [totalCount, setTotalCount] = useState<number>(0);
	const columns: columnType[] = [
		{
			field: "unitId", headerName: '', width: 30,
			renderCell: (params: GridRenderCellParams<any, lhdUnitsType>) => (
				params.row.unitId ? <></> :
					<svg aria-hidden="true" className="icon feather" style={{margin: '3px'}}>
						<use xlinkHref={`${featherIcons}#layers`}></use>
					</svg>
			),
		},
		{field: "name", headerName: t('unit.name'), width: 230},
		{
			field: "institute", headerName: t('unit.institute'), width: 130, valueGetter: (params) => {
				if (params.row.institute && params.row.institute.name) {
						return params.row.institute.name;
				}
				return "";
			}},
		{field: "school", headerName: t('unit.school'), width: 130, valueGetter: (params) => {
				if (params.row.institute && params.row.institute.school && params.row.institute.school.name) {
						return params.row.institute.school.name;
				}
				return "";
			}},
	];

	useEffect(() => {
		loadFetch(0);
	}, [search]);

	useEffect(() => {
		loadSearchHistory();
		handleCurrentPage("units");
	}, [oidc.accessToken]);

	const loadSearchHistory = async () => {
		const results = await fetchSearchHistory(
			env().REACT_APP_GRAPHQL_ENDPOINT_URL,
			oidc.accessToken,
			user,
			'units'
		);
		if ( results.status === 200 && results.data && results.data[0] ) {
			setSearch(results.data[0].search);
		} else {
			console.error('Bad GraphQL results', results);
		}
	};

	const loadFetch = async (newPage: number) => {
		setPage(newPage);
		setLoading(true);
		const results = await fetchUnitsFromFullText(
			env().REACT_APP_GRAPHQL_ENDPOINT_URL,
			oidc.accessToken,
			PAGE_SIZE,
			PAGE_SIZE * newPage,
			search
		);
		if (results.status === 200 && results.data) {
			setTableData(results.data.units);
			setTotalCount(results.data.totalCount);
		} else {
			console.error('Bad GraphQL results', results);
		}
		setLoading(false);
	};

	function onChangeInput(newValue: string) {
		const val = newValue ?? '';
		saveNewSearch(val);
		setSearch(val);
	}

	async function saveNewSearch(val: string) {
		await createNewSearchForUser(
			env().REACT_APP_GRAPHQL_ENDPOINT_URL,
			oidc.accessToken,
			user,
			'units',
			val
		)
	}

	return (
		<Box>
			<Typography gutterBottom>
				{t(`unit.unitList`)}
			</Typography>
			<DebounceInput
				input={search}
				id="member"
				onChange={onChangeInput}
				placeholder={t(`unit.search`)}
				className="debounce-input"
			/>
			<EntriesTableCategory
				tableData={tableData}
				columns={columns}
				loading={loading}
				pageToOpen={"unit"}
				loadServerRows={loadFetch}
				page={page}
				totalCount={totalCount}
				pageSize={PAGE_SIZE}
			/>
		</Box>
	);
}
