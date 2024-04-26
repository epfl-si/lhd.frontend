import { Box } from '@material-ui/core';
import { DataGrid } from '@mui/x-data-grid';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import { TableToolbar } from './TableToolbar';
import { useHistory } from 'react-router-dom';
import { columnType, parameterType } from '../../utils/ressources/types';

type EntriesTableCategoryProps = {
	optionsList?: parameterType[];
	tableData: Object[];
	columns: columnType[];
	loading: boolean;
	pageToOpen:  'room' | 'unit' | 'hazardForms' | 'hazardFormsChild';
	page?: number;
	pageSize?: number;
	totalCount?: number;
	loadServerRows?: (newPage: number) => void;
};

export function EntriesTableCategory({
	optionsList,
	tableData,
	columns,
	loading,
	pageToOpen,
	page,
	pageSize,
	totalCount,
	loadServerRows
}: EntriesTableCategoryProps) {
	const history = useHistory();

	const handlePageChange = (newPage: number) => {
		if ( loadServerRows ) {
			loadServerRows(newPage);
		}
	};

	return (
		<Box width="100%" height="500px">
			{tableData !== null ? (
				(pageToOpen == 'room' || pageToOpen == 'unit') ?
					<DataGrid
						loading={loading}
						disableSelectionOnClick={true}
						rows={tableData}
						columns={columns}
						components={{
							Toolbar: TableToolbar,
						}}
						onRowClick={e => {
							switch ( pageToOpen ) {
								case "unit":
									history.push(`/unitdetails?unit=${encodeURIComponent(e.row['name'])}`);
									break;
								case "room":
									history.push(`/roomdetails?room=${encodeURIComponent(e.row['name'])}`);
									break;
							}
						}}
						getRowId={(row: any) =>  {
							switch ( pageToOpen ) {
								case "unit":
									return row.name;
								case "room":
									return row.id;
							}
						}}
						pagination
						pageSize={pageSize}
						rowsPerPageOptions={[pageSize]}
						rowCount={totalCount}
						paginationMode="server"
						onPageChange={handlePageChange}
						page={page}
					/> :
				<DataGrid
					loading={loading}
					disableSelectionOnClick={true}
					rows={tableData}
					columns={columns}
					components={{
						Toolbar: TableToolbar,
					}}
					onRowClick={e => {
						switch ( pageToOpen ) {
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
							case "hazardForms":
								return row.hazard_category.hazard_category_name;
							case "hazardFormsChild":
								return row.hazard_form_child_name;
						}
					}}
				/>
			) : (
				<p>This space unintentionnally left unblank</p>
			)}
		</Box>
	);
}
