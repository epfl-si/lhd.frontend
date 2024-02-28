import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import React, {useEffect, useState} from "react";
import {fetchUnits, fetchUnitsFromFullText} from "../utils/graphql/FetchingTools";
import {env} from "../utils/env";
import {Box, Typography} from "@material-ui/core";
import {EntriesTableCategory} from "../components/Table/EntriesTableCategory";
import {columnType, lhdUnitsType, parameterType} from "../utils/ressources/types";
import {useTranslation} from "react-i18next";
import featherIcons from "epfl-elements/dist/icons/feather-sprite.svg";
import { GridRenderCellParams } from "@mui/x-data-grid";
import {DebounceInput} from "epfl-elements-react/src/stories/molecules/inputFields/DebounceInput.tsx";

export default function UnitControl() {
	const { t } = useTranslation();
	const oidc = useOpenIDConnectContext();
	const [tableData, setTableData] = useState<lhdUnitsType[]>([]);
	const [optionsList, setOptionsList] = useState<parameterType[]>([]);
	const [loading, setLoading] = useState(false);
	const [search, setSearch] = React.useState('');
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
		const loadFetch = async () => {
			setLoading(true);
			const results = await fetchUnitsFromFullText(
				env().REACT_APP_GRAPHQL_ENDPOINT_URL,
				oidc.accessToken,
				search
			);
			if (results.status === 200) {
				if (results.data) {
					setTableData(results.data);
				} else {
					console.error('Bad GraphQL results', results);
				}
			}
			setLoading(false);
		};
		loadFetch();
	}, [oidc.accessToken, search]);

	function onChangeInput(newValue: string) {
		if (newValue) {
			setSearch(newValue);
		} else {
			setSearch('');
		}
	}

	return (
		<Box>
			<Typography variant="h5" gutterBottom>
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
				optionsList={optionsList}
				tableData={tableData}
				columns={columns}
				loading={loading}
				page={"unit"}
			/>
		</Box>
	);
}
