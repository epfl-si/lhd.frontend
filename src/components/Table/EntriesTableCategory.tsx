import {Box} from '@material-ui/core';
import {DataGrid} from '@mui/x-data-grid';
import React from 'react';
import {TableToolbar} from './TableToolbar';
import {useHistory} from 'react-router-dom';
import {columnType, organismType, parameterType} from '../../utils/ressources/types';
import {useTranslation} from "react-i18next";
import {styled} from '@mui/material/styles';

type EntriesTableCategoryProps = {
	optionsList?: parameterType[];
	tableData: Object[];
	columns: columnType[];
	loading: boolean;
	pageToOpen:  'room' | 'unit' | 'hazardForms' | 'hazardFormsChild' | 'organism' | 'hazards' | 'chemicals' |
		'chemicalauthorizations' | 'chemicalauthorizationsByRoom' | 'radioprotectionauthorization' | 'dispensation';
	page?: number;
	pageSize?: number;
	totalCount?: number;
	loadServerRows?: (newPage: number) => void;
};

const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
	"& .MuiDataGrid-cell": {
		maxHeight: "none !important",
		whiteSpace: "normal",
		lineHeight: "normal !important"
	},
	"& .MuiDataGrid-row": {
		maxHeight: "none !important"
	},
	"& .MuiDataGrid-virtualScrollerContent": {
		height: "100% !important", // Force it to take 100% of the available height
		overflowY: 'auto'
	}
}));

export function EntriesTableCategory({
	optionsList,
	tableData,
	columns,
	loading,
	pageToOpen,
	page,
	pageSize,
	totalCount,
	loadServerRows,
}: EntriesTableCategoryProps) {
	const history = useHistory();
	const { t } = useTranslation();

	const handlePageChange = (newPage: number) => {
		if ( loadServerRows ) {
			loadServerRows(newPage);
		}
	};

	return (
		<Box width="100%" height="500px">
			{tableData !== null ?
				<StyledDataGrid
					style={{fontSize:`${pageToOpen == 'room' ? 'x-small' : 'small'}`}}
					loading={loading}
					disableSelectionOnClick={true}
					rows={tableData}
					columns={columns}
					localeText={{
						toolbarColumns: t('datagrid.columns'),
						toolbarFilters: t('datagrid.filters'),
						toolbarDensity: t('datagrid.density'),
						toolbarExport: t('datagrid.export'),
						toolbarExportCSV: t('datagrid.exportCSV'),
						toolbarExportPrint: t('datagrid.print')
					}}
					disableVirtualization
					components={{
						Toolbar: TableToolbar,
					}}
					onRowClick={e => {
						switch ( pageToOpen ) {
							case "room":
								history.push(`/roomdetails?room=${encodeURIComponent(e.row['name'])}`);
								break;
							case "hazardForms":
								history.push(`/formdetails?cat=${e.row['hazard_category']['hazard_category_name']}`);
								break;
							case "hazardFormsChild":
								history.push(`/hazardFormChildDetails?name=${e.row['hazard_form_child_name']}`);
								break;
						}
					}}
					getRowId={(row: any) =>  {
						switch ( pageToOpen ) {
							case "unit":
								return row.name;
							case "room":
								return row.id;
							case "chemicals":
							case "organism":
								return row.id;
							case "chemicalauthorizations":
							case "chemicalauthorizationsByRoom":
							case "radioprotectionauthorization":
								return row.authorization;
							case "hazards":
								return row.id_lab_has_hazards_child ?? row.id_lab_has_hazards;
							case "hazardForms":
								return row.hazard_category.hazard_category_name;
							case "hazardFormsChild":
								return row.hazard_form_child_name;
							case "dispensation":
								return row.dispensation;
						}
					}}
					pagination
					pageSize={pageSize ?? tableData.length}
					rowsPerPageOptions={[pageSize ?? tableData.length]}
					rowCount={totalCount ?? tableData.length}
					paginationMode="server"
					onPageChange={handlePageChange}
					page={page ?? 0}
				/>
			: (
				<p>This space unintentionally left unblank</p>
			)}
		</Box>
	);
}
