import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import React, {useEffect, useState} from "react";
import {fetchUnits} from "../utils/graphql/FetchingTools";
import {env} from "../utils/env";
import {Box} from "@material-ui/core";
import {EntriesTableCategory} from "../components/Table/EntriesTableCategory";
import {columnType, lhdUnitsType, parameterType} from "../utils/ressources/types";
import {useTranslation} from "react-i18next";

export default function UnitControl() {
	const { t } = useTranslation();
	const oidc = useOpenIDConnectContext();
	const [tableData, setTableData] = useState<lhdUnitsType[]>([]);
	const [optionsList, setOptionsList] = useState<parameterType[]>([]);
	const [loading, setLoading] = useState(false);
	const columns: columnType[] = [
		{field: "name", headerName: t('unit.name'), width: 230},
		{field: "institute", headerName: t('unit.institute'), width: 130, valueGetter: (params) => {
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
			}}
	];

	useEffect(() => {
		const loadFetch = async () => {
			setLoading(true);
			const results = await fetchUnits(
				env().REACT_APP_GRAPHQL_ENDPOINT_URL,
				oidc.accessToken
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
	}, [oidc.accessToken]);

	return (
		<Box>
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
