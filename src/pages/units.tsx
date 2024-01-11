import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import React, {useEffect, useState} from "react";
import {fetchUnits} from "../utils/graphql/FetchingTools";
import {env} from "../utils/env";
import {Box} from "@material-ui/core";
import {EntriesTableCategory} from "../components/Table/EntriesTableCategory";
import {columnType, lhdUnitsType, parameterType} from "../utils/ressources/types";

export default function UnitControl() {
	const oidc = useOpenIDConnectContext();
	const [tableData, setTableData] = useState<lhdUnitsType[]>([]);
	const [optionsList, setOptionsList] = useState<parameterType[]>([]);
	const [loading, setLoading] = useState(false);
	const columns: columnType[] = [
		{field: "name", headerName: "Name", width: 230},
		{field: "institute", headerName: "Institute", width: 130, valueGetter: (params) => {
				if (params.row.institute && params.row.institute.name) {
						return params.row.institute.name;
				}
				return "";
			}},
		{field: "school", headerName: "School", width: 130, valueGetter: (params) => {
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
