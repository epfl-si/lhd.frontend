import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import React, {useEffect, useState} from "react";
import {fetchHazardCategories, fetchHazards} from "../utils/graphql/FetchingTools";
import {env} from "../utils/env";
import {Box, MenuItem, Select, Typography} from "@material-ui/core";
import {EntriesTableCategory} from "../components/Table/EntriesTableCategory";
import {hazardCategory, hazardDetailsType} from "../utils/ressources/types";
import {useTranslation} from "react-i18next";
import {GridRenderCellParams} from "@mui/x-data-grid";
import {SelectChangeEvent} from "@mui/material";
import {useHistory} from "react-router-dom";
import {splitCamelCase} from "../utils/ressources/jsonUtils";
import {handleClickFileLink} from "../utils/ressources/file";
import {MultipleAutocomplete} from "../components/global/MultipleAutocomplete";

interface HazardsControlProps {
	handleCurrentPage: (page: string) => void;
	isUserAuthorized: boolean;
}

export const HazardsControl = ({
	handleCurrentPage,
	isUserAuthorized
}: HazardsControlProps) => {
	const PAGE_SIZE = 100;
	const {t} = useTranslation();
	const history = useHistory();
	const oidc = useOpenIDConnectContext();
	const [tableData, setTableData] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);
	const [totalCount, setTotalCount] = useState<number>(0);

	const [page, setPage] = useState<number>(0);
	const [search, setSearch] = React.useState<string>('');
	const [queryString, setQueryString] = React.useState<string>('');
	const [categoryList, setCategoryList] = React.useState<hazardCategory[]>([]);
	const [isTableReady, setIsTableReady] = React.useState<boolean>(false);
	const columns = React.useRef([{field: "lab_display", headerName: t('room.name'), width: 150}]);
	const [keys, setKeys] = React.useState<string[]>([]);

	useEffect(() => {
		if (isUserAuthorized && search != '') {
			loadFetch();
		}
	}, [search, queryString, page, isUserAuthorized]);

	useEffect(() => {
		handleCurrentPage("hazards");
		setPage(0);
		loadCategories();
	}, [oidc.accessToken]);

	const loadCategories = async  () => {
		const categories = await fetchHazardCategories(
			env().REACT_APP_GRAPHQL_ENDPOINT_URL,
			oidc.accessToken
		);
		if ( categories.status && categories.status === 200 && categories.data ) {
			setCategoryList(categories.data);
		} else {
			console.error('Bad GraphQL results', categories);
		}
	}

	const loadFetch = async () => {
		if (page != undefined && search != '') {
			setLoading(true);
			const results = await fetchHazards(
				env().REACT_APP_GRAPHQL_ENDPOINT_URL,
				oidc.accessToken,
				PAGE_SIZE,
				PAGE_SIZE * page,
				search,
				queryString
			);

			if ( results.status && results.status === 200 && results.data ) {
				setTableData(parseAndFlatResult(results.data.hazards));
				setTotalCount(results.data.totalCount);
			} else {
				console.error('Bad GraphQL results', results);
			}
			setLoading(false);
		}
	};

	const parseAndFlatResult = (hazards: hazardDetailsType[]) => {
		const parsedHazards = hazards.map(h => {
			return {
				lab_display: h.lab_display,
				id_lab_has_hazards_child: h.id_lab_has_hazards_child,
				id_lab_has_hazards: h.id_lab_has_hazards,
				child_submission: h.child_submission ? JSON.parse(h.child_submission).data : {},
				parent_submission: JSON.parse(h.parent_submission).data
			};
		});
		const allKeys = new Set<string>();
		for (const item of parsedHazards) {
			for (const key of ['child_submission', 'parent_submission']) {
				if (item[key]) {
					Object.keys(item[key]).forEach(k => allKeys.add(k));
				}
			}
		}
		setKeys(Array.from(allKeys));
		const result = parsedHazards.map(item => {
			const flat = {
				lab_display: item.lab_display,
				id_lab_has_hazards_child: item.id_lab_has_hazards_child,
				id_lab_has_hazards: item.id_lab_has_hazards,
			};

			// Add all keys with null by default
			for (const key of allKeys) {
				flat[key] = null;
				if(key !== 'status' && key !== 'delete') {
					if (key == 'fileLink') {
						columns.current.push({field: key, headerName: splitCamelCase(key), width: 200,
							renderCell: (params: GridRenderCellParams<any, any>) => (
								params.row.fileLink ?
									<a href={params.row.fileLink}
										 onClick={e => handleClickFileLink(e, oidc.accessToken, params.row.fileLink)}>{params.row.fileLink.split('/').pop()}</a> : <></>
							)
						});
					} else {
						columns.current.push({field: key, headerName: splitCamelCase(key), width: key == 'comment' ? 300 : 200});
					}
				}
			}
			setIsTableReady(true)

			// Overwrite with actual values
			for ( const key of ['child_submission', 'parent_submission']) {
				if (item[key]) {
					Object.entries(item[key]).forEach(([k, v]) => {
						if (k == 'chemical')
							flat[k] = v['haz_en'];
						else if (k == 'organism')
							flat[k] = v['organism'];
						else if (k == 'container')
							flat[k] = v['name'];
						else
							flat[k] = v;
					});
				}
			}

			return flat;
		});
		return result;
	}

	const handleCategoryChange = (event: SelectChangeEvent) => {
		setSearch(event.target.value as string);
		setIsTableReady(false);
		setQueryString('');
		columns.current = [{field: "lab_display", headerName: t('room.name'), width: 150}];
		history.push(`/hazardscontrol?Category=${(event.target.value)}`);
	};

	return (
		<Box>
			{isUserAuthorized ? <>
			<Typography gutterBottom>
				{t(`hazard.hazardList`)}
			</Typography>
			<div className="utilsBar" style={{display: "flex", flexDirection: "row", justifyContent: "space-between"}}>
				<Select
					style={{width: '50%', marginRight: "10px"}}
					labelId="demo-simple-select-label"
					id="demo-simple-select"
					value={search}
					label={t(`hazard.category`)}
					onChange={handleCategoryChange}
				>
					{categoryList.map(cat => <MenuItem value={cat.hazard_category_name}>{cat.hazard_category_name}</MenuItem>)}
				</Select>
				<MultipleAutocomplete
						setPage={setPage}
						setSearch={setQueryString}
						parent="hazardscontrol"
						category={search}
						columns={keys}
						setCategory={setSearch}
				/>
			</div>
				{search && isTableReady &&
			<EntriesTableCategory
				tableData={tableData}
				columns={columns.current}
				loading={loading}
				pageToOpen={"hazards"}
				loadServerRows={setPage}
				page={page}
				totalCount={totalCount}
				pageSize={PAGE_SIZE}
			/>}
			</> : <b>You are not authorized for this page</b>}
		</Box>
	);
}
