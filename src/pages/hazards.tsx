import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import React, {useEffect, useState} from "react";
import {fetchHazardCategories, fetchHazards} from "../utils/graphql/FetchingTools";
import {env} from "../utils/env";
import {Box, MenuItem, Select, Typography} from "@material-ui/core";
import {EntriesTableCategory} from "../components/Table/EntriesTableCategory";
import {hazardCategory, hazardDetailsType, notificationType} from "../utils/ressources/types";
import {useTranslation} from "react-i18next";
import {GridRenderCellParams} from "@mui/x-data-grid";
import {SelectChangeEvent} from "@mui/material";
import {Redirect, useHistory, useLocation} from "react-router-dom";
import {splitCamelCase} from "../utils/ressources/jsonUtils";
import {exportToExcel, getHazardExportFileName, handleClickFileLink} from "../utils/ressources/file";
import {MultipleAutocomplete} from "../components/global/MultipleAutocomplete";
import {Button} from "epfl-elements-react-si-extra";
import {AlertDialog} from "../components/global/AlertDialog";
import {deleteHazardChild} from "../utils/graphql/PostingTools";
import Notifications from "../components/Table/Notifications";
import {notificationsVariants} from "../utils/ressources/variants";

interface HazardsControlProps {
	handleCurrentPage: (page: string) => void;
	isUserAuthorized: boolean;
}

export const HazardsControl = ({
	handleCurrentPage,
	isUserAuthorized
}: HazardsControlProps) => {
	const location = useLocation();
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
	const columns = React.useRef([
		{
			field: "lab_display", headerName: t('room.name'), width: 150,
			renderCell: (params: GridRenderCellParams<any, any>) => (
				<a href={`/roomdetails?room=${encodeURIComponent(params.row.lab_display)}`} target="_blank">{params.row.lab_display}</a>
			)
		},
		{
			field: "modified_by", headerName: t('organism.updated_by'), width: 100,
			renderCell: (params: GridRenderCellParams<any, any>) => (
				params.row.modified_by
			)
		},
		{
			field: "modified_on", headerName: t('organism.updated_on'), width: 100,
			renderCell: (params: GridRenderCellParams<any, any>) => (
				(new Date(params.row.modified_on)).toLocaleDateString("en-GB")
			)
		}]);
	const [keys, setKeys] = React.useState<string[]>([]);
	const [openDialog, setOpenDialog] = useState<boolean>(false);
	const [selectedHazard, setSelectedHazard] = useState<string>();
	const [deleted, setDeleted] = useState(false);
	const [notificationType, setNotificationType] = useState<notificationType>({
		type: "info",
		text: '',
	});
	const [openNotification, setOpenNotification] = useState<boolean>(false);

	useEffect(() => {
		if (location.search == '') {
			setSearch('');
			setQueryString('');
		}
	}, [location]);

	useEffect(() => {
		if (isUserAuthorized && search != '') {
			loadFetch();
		}
		setDeleted(false);
	}, [search, queryString, page, isUserAuthorized, deleted]);

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

	const handleOpen = (res: any) => {
		if (res.data?.deleteHazardChild?.errors || res.data?.deleteHazardChild?.errors) {
			const notif: notificationType = {
				text: res.data?.deleteHazardChild?.errors[0].message,
				type: 'error'
			};
			setNotificationType(notif);
		} else if (res.status === 200) {
			setNotificationType(notificationsVariants['update_success']);
		} else {
			setNotificationType(notificationsVariants['update_error']);
		}
		setOpenNotification(true);
	};

	const handleClose = () => {
		setOpenNotification(false);
	};

	const parseAndFlatResult = (hazards: hazardDetailsType[]) => {
		const parsedHazards = hazards.map(h => {
			return {
				lab_display: h.lab_display,
				id_lab_has_hazards_child: h.id_lab_has_hazards_child,
				id_lab_has_hazards: h.id_lab_has_hazards,
				child_submission: h.child_submission ? JSON.parse(h.child_submission).data : {},
				parent_submission: JSON.parse(h.parent_submission).data,
				global_comment: h.global_comment,
				modified_by: h.modified_by,
				modified_on: h.modified_on
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
				global_comment: item.global_comment,
				modified_by: item.modified_by,
				modified_on: item.modified_on
			};

			// Add all keys with null by default
			for (const key of allKeys) {
				flat[key] = null;
				if(key !== 'status' && key !== 'delete') {
						columns.current.push({field: key, headerName: splitCamelCase(key), width: key == 'comment' ? 300 : 200,
							renderCell: (params: GridRenderCellParams<any, any>) => (
								key == 'fileLink' && params.row.fileLink ?
									<a href={params.row.fileLink}
										 onClick={e => handleClickFileLink(e, oidc.accessToken, params.row.fileLink)}>{params.row.fileLink.split('/').pop()}</a> :
									<>{params.row[key]}</>
							)
						});
				}
			}
			if (search == 'Biological') {
				columns.current.push({field: "id_lab_has_hazards_child", headerName: t('organism.actions'), width: 300, disableExport: true,
					renderCell: (params: GridRenderCellParams<any, any>) => (
							<Button size="icon"
											style={{visibility: params.row.id_lab_has_hazards_child ? "visible" : "hidden"}}
											iconName={`#trash`}
											onClick={() => {
												console.log(params.row)
												setOpenDialog(true);
												setSelectedHazard(params.row.id_lab_has_hazards_child);
											}}/>
					)
				});
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
		columns.current = [{field: "lab_display", headerName: t('room.name'), width: 150,
			renderCell: (params: GridRenderCellParams<any, any>) => (
				<a href={`/roomdetails?room=${encodeURIComponent(params.row.lab_display)}`} target="_blank">{params.row.lab_display}</a>
			)}];
		history.push(`/hazardscontrol?Category=${(event.target.value)}`);
	};

	function handleHazardDelete() {
		deleteHazardChild(
			env().REACT_APP_GRAPHQL_ENDPOINT_URL,
			oidc.accessToken,
			JSON.stringify(selectedHazard),
		).then(res => {
			if(res.status == 200 && !res.data?.deleteHazardChild?.errors) {
				setDeleted(true);
			}
			handleOpen(res);
			setOpenDialog(false);
			setSelectedHazard('');
		});
	}

	const onExport = async () => {
		if ( isUserAuthorized && search != '' ) {
			setLoading(true);
			const results = await fetchHazards(
				env().REACT_APP_GRAPHQL_ENDPOINT_URL,
				oidc.accessToken,
				0,
				0,
				search,
				queryString
			);

			if ( results.status && results.status === 200 && results.data ) {
				const data = parseAndFlatResult(results.data.hazards);
				const filteredData = [];
				for (const obj of data) {
					const newObj = {};
					for (let key in obj) {
						if (!['id_lab_has_hazards_child', 'id_lab_has_hazards', 'delete', 'status'].includes(key)) {
							switch (key) {
								case 'modified_on':
									newObj[key] = (new Date(obj[key])).toLocaleDateString("en-GB");
									break;
								case 'global_comment':
									newObj[key] = decodeURIComponent(obj[key]);
									break;
								default:
									newObj[key] = obj[key];
									break;
							}

						}
					}
					filteredData.push(newObj);
				}
				exportToExcel(filteredData, getHazardExportFileName(search));
			} else {
				console.error('Bad GraphQL results', results);
			}
			setLoading(false);
		}
	}

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
				<Button
					isDisabled={tableData.length == 0}
					style={{minWidth: '10%', padding: '10px', marginLeft: '10px'}}
					onClick={() => onExport()}
					label={t(`generic.export`)}
					iconName={`#download`}
					primary/>
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
				<AlertDialog openDialog={openDialog}
											onOkClick={handleHazardDelete}
											onCancelClick={() => {
												setOpenDialog(false);
												setSelectedHazard('');
											}}
											cancelLabel={t('generic.cancelButton')}
											okLabel={t('generic.deleteButton')}
											title={t('hazards.deleteHazardConfirmationMessageTitle')}>
			</AlertDialog>
				<Notifications
					open={openNotification}
					notification={notificationType}
					close={handleClose}
				/>
				{deleted ? <Redirect to={"/hazardscontrol?Category=Biological&" + queryString}/> : <></>}
			</> : <b>You are not authorized for this page</b>}
		</Box>
	);
}
