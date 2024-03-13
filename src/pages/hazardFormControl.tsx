import {useTranslation} from "react-i18next";
import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import React, {useEffect, useState} from "react";
import {columnType, hazardFormType, lhdUnitsType, notificationType} from "../utils/ressources/types";
import {fetchHazardForms} from "../utils/graphql/FetchingTools";
import {env} from "../utils/env";
import {Box, Typography} from "@material-ui/core";
import {EntriesTableCategory} from "../components/Table/EntriesTableCategory";
import {GridRenderCellParams} from "@mui/x-data-grid";
import featherIcons from "epfl-elements/dist/icons/feather-sprite.svg";
import {FormDialog} from "../components/global/FormDialog";
import {createNewHazardCategory, updateFormHazard} from "../utils/graphql/PostingTools";
import {notificationsVariants} from "../utils/ressources/variants";
import Notifications from "../components/Table/Notifications";
import {Button} from "epfl-elements-react/src/stories/molecules/Button.tsx";
import {FormBuilder} from "@formio/react";
import {useHistory} from "react-router-dom";

export default function HazardFormControl() {
	const { t } = useTranslation();
	const oidc = useOpenIDConnectContext();
	const history = useHistory();
	const [tableData, setTableData] = useState<hazardFormType[]>([]);
	const [row, setRow] = useState<hazardFormType>();
	const [loading, setLoading] = useState(false);
	const [newHazard, setNewHazard] = useState(false);
	const [openDialog, setOpenDialog] = useState(false);
	const [openNotification, setOpenNotification] = useState<boolean>(false);
	const [notificationType, setNotificationType] = useState<notificationType>({
		type: "info",
		text: '',
	});
	const columns: columnType[] = [
		{field: "version", headerName: t(`HazardFormControl.version`), width: 200},
		{field: "hazard_category_name", headerName: t(`HazardFormControl.category`), width: 200, valueGetter: (params) => {
				if (params.row.hazard_category) {
					return params.row.hazard_category.hazard_category_name;
				}
				return "";
			}}/*,
		{
			field: "form", headerName: '', width: 30,
			renderCell: (params: GridRenderCellParams<any, lhdUnitsType>) => (
				<svg aria-hidden="true" className="icon feather" style={{margin: '3px'}} onClick={(event) => modifyForm(params.row)}>
					<use xlinkHref={`${featherIcons}#edit-3`}></use>
				</svg>
			),
		}*/
	];

	useEffect(() => {
		loadFetch();
	}, [oidc.accessToken]);

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

	function modifyForm(row: hazardFormType) {
		setOpenDialog(true);
		setRow(row);
		setNewHazard(false);
	}

	function saveForm(row: hazardFormType | undefined) {
		setOpenDialog(false);
		if (row) {
			if (newHazard) {
				createNewHazardCategory (
					env().REACT_APP_GRAPHQL_ENDPOINT_URL,
					oidc.accessToken,
					row
				).then(res => {
					handleOpen(res);
				});
			} else {
				updateFormHazard (
					env().REACT_APP_GRAPHQL_ENDPOINT_URL,
					oidc.accessToken,
					row
				).then(res => {
					handleOpen(res);
				});
			}
		}
	}

	const handleOpen = async (res: any) => {
		if ( res.data?.updateForm?.errors ) {
			const notif: notificationType = {
				text: res.data?.updateForm?.errors[0].message,
				type: 'error'
			};
			setNotificationType(notif);
		} else if ( res.status === 200 ) {
			setNotificationType(notificationsVariants['unit-update-success']);
		} else {
			setNotificationType(notificationsVariants['unit-update-error']);
		}
		setOpenNotification(true);
		await loadFetch();
	};

	const handleClose = () => {
		setOpenNotification(false);
	};

	return <Box>
			<Typography variant="h5" gutterBottom>
				{t(`HazardFormControl.title`)}
			</Typography>
			<EntriesTableCategory
				optionsList={[]}
				tableData={tableData}
				columns={columns}
				loading={loading}
				page={"hazardForms"}
			/>
			<div style={{marginTop: '50px'}}>
				<Button
					onClick={() => {
						/*setOpenDialog(true);
						setNewHazard(true);*/
						history.push(`/formdetails?cat=NewCategory`);
					}}
					label={t(`HazardFormControl.addNewCategory`)}
					iconName={`${featherIcons}#save`}
					primary/>
			</div>
			{/*<FormDialog openDialog={openDialog} row={row}
									onClick={saveForm} newHazard={newHazard}/>*/}
			<Notifications
				open={openNotification}
				notification={notificationType}
				close={handleClose}
			/>
		</Box>;
}
