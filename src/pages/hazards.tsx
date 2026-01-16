import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import React, {useEffect, useState} from "react";
import {fetchHazardCategories, fetchHazards} from "../utils/graphql/FetchingTools";
import {env} from "../utils/env";
import {Box, Chip, MenuItem, Select, Typography} from "@material-ui/core";
import {EntriesTableCategory} from "../components/Table/EntriesTableCategory";
import {hazardCategory, hazardDetailsType, notificationType} from "../utils/ressources/types";
import {useTranslation} from "react-i18next";
import {GridRenderCellParams} from "@mui/x-data-grid";
import {SelectChangeEvent} from "@mui/material";
import {Redirect, useHistory, useLocation} from "react-router-dom";
import {splitCamelCase} from "../utils/ressources/jsonUtils";
import {exportToExcel, getExportFileName, handleClickFileLink} from "../utils/ressources/file";
import {MultipleAutocomplete} from "../components/global/MultipleAutocomplete";
import {Button} from "epfl-elements-react-si-extra";
import {AlertDialog} from "../components/global/AlertDialog";
import {deleteHazard, deleteHazardChild} from "../utils/graphql/PostingTools";
import Notifications from "../components/Table/Notifications";
import {notificationsVariants} from "../utils/ressources/variants";
import {getErrorMessage} from "../utils/graphql/Utils";
import {Tooltip} from "@mui/joy";

interface HazardsControlProps {
	handleCurrentPage: (page: string) => void;
	user: any;
}

export const HazardsControl = ({
	handleCurrentPage,
	user
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
			field: "global_comment", headerName: t('hazards.global_comment'), width: 200, hide: true,
			renderCell: (params: GridRenderCellParams<any, any>) => (
				decodeURIComponent(params.row.global_comment)
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
		},
		{
			field: "tags", headerName: 'Tags', width: 100,
			renderCell: (params: GridRenderCellParams<any, any>) => {
				if (!params.row.tags) return '';
				const tags = params.row.tags.split('&&');
				return <div style={{display: "flex", flexDirection: 'column'}}>{tags.map(tag => {
					const keyValue = tag.split('=');
					return <Tooltip title={keyValue[1]}>
						<Chip
							className="smallChip"
							label={keyValue[0]}
						/>
					</Tooltip>
				})}</div>
			}
		}]);
	const [keys, setKeys] = React.useState<string[]>([]);
	const [openDialog, setOpenDialog] = useState<boolean>(false);
	const [selectedHazard, setSelectedHazard] = useState<string>();
	const [selectedParentHazard, setSelectedParentHazard] = useState<string>();
	const [deleted, setDeleted] = useState(false);
	const [notificationType, setNotificationType] = useState<notificationType>({
		type: "info",
		text: '',
	});
	const [openNotification, setOpenNotification] = useState<boolean>(false);

	useEffect(() => {
		if (location.search === '') {
			setSearch('');
			setQueryString('');
		}
	}, [location]);

	useEffect(() => {
		if (user.canListHazards && search != '') {
			loadFetch();
		}
		setDeleted(false);
	}, [search, queryString, page, user, deleted]);

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
			const errors = getErrorMessage(categories, 'hazardCategories');
			setNotificationType(errors.notif);
			setOpenNotification(true);
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
				const errors = getErrorMessage(results, 'hazardsWithPagination');
				setNotificationType(errors.notif);
				setOpenNotification(true);
			}
			setLoading(false);
		}
	};

	const handleOpen = (res: any) => {
		const errors = getErrorMessage(res, 'deleteHazardChild');
		if (errors.errorCount > 0) {
			setNotificationType(errors.notif);
		} else if (res.status === 200) {
			setDeleted(true);
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
				modified_on: h.modified_on,
				tags: h.tags
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
				modified_on: item.modified_on,
				tags: item.tags
			};

			// Add all keys with null by default
			for (const key of allKeys) {
				flat[key] = null;
				if(key !== 'status' && key !== 'delete') {
						columns.current.push({field: key, headerName: splitCamelCase(key), width: key === 'comment' ? 300 : 200,
							renderCell: (params: GridRenderCellParams<any, any>) => (
								key === 'fileLink' && params.row.fileLink ?
									<a href={params.row.fileLink}
										 onClick={async e => await handleClickFileLink(e, oidc.accessToken, params.row.id_lab_has_hazards_child, 'labHasHazardsChild')
										 }>{params.row.fileLink.split('/').pop()}</a> :
									<>{params.row[key]}</>
							)
						});
				}
			}
			if (search === 'Biological') {
				columns.current.push({field: "id_lab_has_hazards_child", headerName: t('organism.actions'), width: 300, disableExport: true,
					renderCell: (params: GridRenderCellParams<any, any>) => (
							user.canEditOrganisms ? <Button size="icon"
											iconName={`#trash`}
											onClick={() => {
												setOpenDialog(true);
												setSelectedHazard(params.row.id_lab_has_hazards_child);
												setSelectedParentHazard(params.row.id_lab_has_hazards);
											}}/> : <></>
					)
				});
			}
			setIsTableReady(true)

			// Overwrite with actual values
			for ( const key of ['child_submission', 'parent_submission']) {
				if (item[key]) {
					Object.entries(item[key]).forEach(([k, v]) => {
						if (k === 'chemical')
							flat[k] = v['haz_en'];
						else if (k === 'organism')
							flat[k] = v['organism'];
						else if (k === 'container')
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
			)},
			{
				field: "global_comment", headerName: t('hazards.global_comment'), width: 200, hide: true,
				renderCell: (params: GridRenderCellParams<any, any>) => (
					decodeURIComponent(params.row.global_comment)
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
			},
			{
				field: "tags", headerName: 'Tags', width: 100,
				renderCell: (params: GridRenderCellParams<any, any>) => {
					if (!params.row.tags) return '';
					const tags = params.row.tags.split('&&');
					return <div style={{display: "flex", flexDirection: 'column'}}>{tags.map(tag => {
						const keyValue = tag.split('=');
						return <Tooltip title={keyValue[1]}>
							<Chip
								className="smallChip"
								label={keyValue[0]}
							/>
						</Tooltip>
					})}</div>
				}
			}];
		history.push(`/hazardscontrol?Category=${(event.target.value)}`);
	};

	function handleHazardDelete() {
		if (selectedHazard) {
			deleteHazardChild(
				env().REACT_APP_GRAPHQL_ENDPOINT_URL,
				oidc.accessToken,
				JSON.stringify(selectedHazard),
			).then(res => {
				handleOpen(res);
				resetHazard();
			});
		} else if (selectedParentHazard) {
			deleteHazard(
				env().REACT_APP_GRAPHQL_ENDPOINT_URL,
				oidc.accessToken,
				JSON.stringify(selectedParentHazard),
			).then(res => {
				handleOpen(res);
				resetHazard();
			});
		}
	}

	const onExport = async () => {
		if ( user.canListHazards && search != '' ) {
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
									newObj[key] = obj[key] ? decodeURIComponent(obj[key]) : '';
									break;
								case 'tags':
									newObj[key] = '';
									if (obj[key]) {
										const keys = [...obj[key].matchAll(/(\w+)=/g)].map(m => m[1]);
										newObj[key] = keys.join(', ')
									}
									break;
								default:
									newObj[key] = obj[key];
									break;
							}

						}
					}
					filteredData.push(newObj);
				}
				exportToExcel(filteredData, getExportFileName(search));
			} else {
				const errors = getErrorMessage(results, 'hazardsWithPagination');
				setNotificationType(errors.notif);
				setOpenNotification(true);
			}
			setLoading(false);
		}
	}

	function resetHazard () {
		setOpenDialog(false);
		setSelectedHazard('');
		setSelectedParentHazard('');
	}

	return (
		<Box>
			{user.canListHazards ? <>
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
				{search && isTableReady ?
			<EntriesTableCategory
				tableData={tableData}
				columns={columns.current}
				loading={loading}
				pageToOpen={"hazards"}
				loadServerRows={setPage}
				page={page}
				totalCount={totalCount}
				pageSize={PAGE_SIZE}
			/> : <Box width="100%" height="500px"/>}
				<AlertDialog openDialog={openDialog}
											onOkClick={handleHazardDelete}
											onCancelClick={resetHazard}
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
