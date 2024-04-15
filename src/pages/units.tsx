import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import React, {useEffect, useState} from "react";
import {fetchunitsFromFullTextAndPagination} from "../utils/graphql/FetchingTools";
import {env} from "../utils/env";
import {Box, Typography} from "@material-ui/core";
import {EntriesTableCategory} from "../components/Table/EntriesTableCategory";
import {columnType, lhdUnitsType} from "../utils/ressources/types";
import {useTranslation} from "react-i18next";
import featherIcons from "epfl-elements/dist/icons/feather-sprite.svg";
import {GridRenderCellParams} from "@mui/x-data-grid";
import {DebounceInput} from "epfl-elements-react/src/stories/molecules/inputFields/DebounceInput.tsx";
import {useHistory} from "react-router-dom";
import "../../css/styles.scss";
import {Button} from "epfl-elements-react/src/stories/molecules/Button.tsx";
import {AddNewUnitDialog} from "../components/Units/AddnewUnitDialog";

interface UnitControlProps {
	handleCurrentPage: (page: string) => void;
	user: number;
}

export const UnitControl = ({
	handleCurrentPage,
	user
}: UnitControlProps) => {
	const PAGE_SIZE = 100;
	const history = useHistory();
	const { t } = useTranslation();
	const oidc = useOpenIDConnectContext();
	const [openDialog, setOpenDialog] = useState<boolean>(false);
	const [tableData, setTableData] = useState<lhdUnitsType[]>([]);
	const [loading, setLoading] = useState(false);
	const [search, setSearch] = React.useState('');
	const [page, setPage] = useState<number>(0);
	const [totalCount, setTotalCount] = useState<number>(0);
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
		loadFetch();
	}, [search, page]);

	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		if (urlParams.has('search')) {
			setSearch(decodeURIComponent(urlParams.get('search') as string));
		}
		handleCurrentPage("units");
	}, [oidc.accessToken]);

	const loadFetch = async () => {
		setLoading(true);
		const results = await fetchunitsFromFullTextAndPagination(
			env().REACT_APP_GRAPHQL_ENDPOINT_URL,
			oidc.accessToken,
			PAGE_SIZE,
			PAGE_SIZE * page,
			search
		);
		if (results.status === 200 && results.data) {
			setTableData(results.data.units);
			setTotalCount(results.data.totalCount);
		} else {
			console.error('Bad GraphQL results', results);
		}
		setLoading(false);
	};

	function onChangeInput(newValue: string) {
		const val = newValue ?? '';
		setSearch(val);
		history.push(`/unitcontrol?search=${encodeURIComponent(val)}`);
	}

	return (
		<Box>
			<Typography gutterBottom>
				{t(`unit.unitList`)}
			</Typography>
			<div className="utilsBar">
				<DebounceInput
					input={search}
					id={search + "'_id"}
					key={search + "'_id"}
					onChange={onChangeInput}
					placeholder={t(`unit.search`)}
					className="debounce-input"
				/>
				<Button
					onClick={() => setOpenDialog(true)}
					label={t(`generic.addNew`)}
					iconName={`${featherIcons}#plus-circle`}
					primary/>
			</div>
			<EntriesTableCategory
				tableData={tableData}
				columns={columns}
				loading={loading}
				pageToOpen={"unit"}
				loadServerRows={setPage}
				page={page}
				totalCount={totalCount}
				pageSize={PAGE_SIZE}
			/>
			<AddNewUnitDialog openDialog={openDialog} close={() => setOpenDialog(false)}
												save={(searchVal: string) => {
													setOpenDialog(false);
													onChangeInput(searchVal);
												}}/>
		</Box>
	);
}
