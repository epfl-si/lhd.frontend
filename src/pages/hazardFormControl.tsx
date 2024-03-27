import {useTranslation} from "react-i18next";
import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import React, {useEffect, useState} from "react";
import {columnType, hazardFormType} from "../utils/ressources/types";
import {fetchHazardForms} from "../utils/graphql/FetchingTools";
import {env} from "../utils/env";
import {Box, Typography} from "@material-ui/core";
import {EntriesTableCategory} from "../components/Table/EntriesTableCategory";
import featherIcons from "epfl-elements/dist/icons/feather-sprite.svg";
import {Button} from "epfl-elements-react/src/stories/molecules/Button.tsx";
import {useHistory} from "react-router-dom";


interface HazardFormControlProps {
	handleCurrentPage: (page: string) => void;
	user: number;
}

export const HazardFormControl = ({
	handleCurrentPage,
	user
}: HazardFormControlProps) => {
	const { t } = useTranslation();
	const oidc = useOpenIDConnectContext();
	const history = useHistory();
	const [tableData, setTableData] = useState<hazardFormType[]>([]);
	const [loading, setLoading] = useState(false);
	const columns: columnType[] = [
		{field: "version", headerName: t(`hazardFormControl.version`), width: 200},
		{field: "hazard_category_name", headerName: t(`hazardFormControl.category`), width: 200, valueGetter: (params) => {
				if (params.row.hazard_category) {
					return params.row.hazard_category.hazard_category_name;
				}
				return "";
			}}
	];

	useEffect(() => {
		loadFetch();
		handleCurrentPage("hazardForms");
	}, [oidc.accessToken]);

	const loadFetch = async () => {
		setLoading(true);
		const resultsHazardCategory = await fetchHazardForms(
			env().REACT_APP_GRAPHQL_ENDPOINT_URL,
			oidc.accessToken
		);

		if (resultsHazardCategory.status === 200 && resultsHazardCategory.data && typeof resultsHazardCategory.data !== 'string') {
			console.log(resultsHazardCategory.data)
			setTableData(resultsHazardCategory.data);
		}
		setLoading(false);
	};

	return <Box>
			<Typography gutterBottom>
				{t(`hazardFormControl.title`)}
			</Typography>
			<EntriesTableCategory
				tableData={tableData}
				columns={columns}
				loading={loading}
				pageToOpen={"hazardForms"}
			/>
			<div style={{marginTop: '50px'}}>
				<Button
					onClick={() => {
						history.push(`/formdetails?cat=NewCategory`);
					}}
					label={t(`hazardFormControl.addNewCategory`)}
					iconName={`${featherIcons}#save`}
					primary/>
			</div>
		</Box>;
}
