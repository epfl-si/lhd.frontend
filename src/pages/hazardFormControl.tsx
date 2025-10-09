import {useTranslation} from "react-i18next";
import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import React, {useEffect, useState} from "react";
import {columnType, hazardFormType, notificationType} from "../utils/ressources/types";
import {fetchHazardForms} from "../utils/graphql/FetchingTools";
import {env} from "../utils/env";
import {Box, Typography} from "@material-ui/core";
import {EntriesTableCategory} from "../components/Table/EntriesTableCategory";
import {Button} from "epfl-elements-react-si-extra";
import {useHistory} from "react-router-dom";
import Notifications from "../components/Table/Notifications";
import {notificationsVariants} from "../utils/ressources/variants";


interface HazardFormControlProps {
	handleCurrentPage: (page: string) => void;
	isUserAuthorized: boolean;
}

export const HazardFormControl = ({
	handleCurrentPage,
	isUserAuthorized
}: HazardFormControlProps) => {
	const { t } = useTranslation();
	const oidc = useOpenIDConnectContext();
	const history = useHistory();
	const [tableData, setTableData] = useState<hazardFormType[]>([]);
	const [loading, setLoading] = useState(false);
	const [notificationType, setNotificationType] = useState<notificationType>({
		type: "info",
		text: '',
	});
	const [openNotification, setOpenNotification] = useState<boolean>(false);
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
		if (isUserAuthorized) {
			loadFetch();
		}
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
		} else {
			console.error('Bad GraphQL results', resultsHazardCategory);

			setNotificationType(notificationsVariants['bad_graphql_query']);
			setOpenNotification(true);
		}
		setLoading(false);
	};

	const handleClose = () => {
		setOpenNotification(false);
	};

	return <Box>
		{isUserAuthorized ? <><Typography gutterBottom>
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
			iconName={`#save`}
			primary/>
	</div></> : <b>You are not authorized for this page</b>}
		<Notifications
			open={openNotification}
			notification={notificationType}
			close={handleClose}
		/>
	</Box>
	;
}
