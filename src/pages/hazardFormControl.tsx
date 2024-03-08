import {useTranslation} from "react-i18next";
import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import React, {useEffect, useState} from "react";
import {columnType, hazardFormType, lhdUnitsType, parameterType} from "../utils/ressources/types";
import {fetchHazardForms} from "../utils/graphql/FetchingTools";
import {env} from "../utils/env";
import {Box, Typography} from "@material-ui/core";
import {EntriesTableCategory} from "../components/Table/EntriesTableCategory";
import {GridRenderCellParams} from "@mui/x-data-grid";
import featherIcons from "epfl-elements/dist/icons/feather-sprite.svg";
import {FormDialog} from "../components/global/FormDialog";

export default function HazardFormControl() {

	const { t } = useTranslation();
	const oidc = useOpenIDConnectContext();
	const [tableData, setTableData] = useState<hazardFormType[]>([]);
	const [row, setRow] = useState<hazardFormType>();
	const [optionsList, setOptionsList] = useState<parameterType[]>([]);
	const [loading, setLoading] = useState(false);
	const [openDialog, setOpenDialog] = useState(false);
	const [search, setSearch] = React.useState('');
	const columns: columnType[] = [
		{field: "version", headerName: t(`HazardFormControl.version`), width: 200},
		{field: "hazard_category_name", headerName: t(`HazardFormControl.category`), width: 200, valueGetter: (params) => {
				if (params.row.hazard_category) {
					return params.row.hazard_category.hazard_category_name;
				}
				return "";
			}},
		{
			field: "form", headerName: '', width: 30,
			renderCell: (params: GridRenderCellParams<any, lhdUnitsType>) => (
				<svg aria-hidden="true" className="icon feather" style={{margin: '3px'}} onClick={(event) => modifyForm(params.row)}>
					<use xlinkHref={`${featherIcons}#edit-3`}></use>
				</svg>
			),
		}
	];

	function modifyForm(row: hazardFormType) {
		setOpenDialog(true);
		setRow(row);
	}

	function saveForm(row: hazardFormType | undefined) {
		setOpenDialog(false);
		console.log(row);
	}

	useEffect(() => {
		const loadFetch = async () => {
			setLoading(true);
			const resultsHazardCategory = await fetchHazardForms(
				env().REACT_APP_GRAPHQL_ENDPOINT_URL,
				oidc.accessToken
			);

			if (resultsHazardCategory.status === 200 && resultsHazardCategory.data && typeof resultsHazardCategory.data !== 'string') {
				setTableData(resultsHazardCategory.data);
			}
			setLoading(false);
		};
		loadFetch();
	}, [oidc.accessToken, search]);

	return (
		<Box>
			<Typography variant="h5" gutterBottom>
				{t(`HazardFormControl.title`)}
			</Typography>
			<EntriesTableCategory
				optionsList={optionsList}
				tableData={tableData}
				columns={columns}
				loading={loading}
				page={"hazardForms"}
			/>
			<FormDialog openDialog={openDialog} row={row} onClick={saveForm}/>
		</Box>
	);
}
