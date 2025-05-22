import * as React from 'react';
import {useEffect} from 'react';
import {useTranslation} from "react-i18next";
import {AlertDialog} from "../global/AlertDialog";
import {env} from "../../utils/env";
import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import {fetchHazardCategories, fetchRoomsForExport} from "../../utils/graphql/FetchingTools";
import {hazardCategory} from "../../utils/ressources/types";
import {MenuItem, Select} from "@material-ui/core";
import {FormControlLabel, SelectChangeEvent, Switch} from "@mui/material";
import {exportToExcel} from "../../utils/ressources/file";

interface ExportDialogProps {
	openDialog: boolean;
	save: () => void;
	close: () => void;
}

export const ExportDialog = ({
	openDialog,
	close,
	save
}: ExportDialogProps) => {
	const oidc = useOpenIDConnectContext();
	const { t } = useTranslation();
	const [hazard, setHazard] = React.useState<string>('');
	const [categoryList, setCategoryList] = React.useState<hazardCategory[]>([]);
	const [units, setUnits] = React.useState<boolean>(false);
	const [cosecs, setCosecs] = React.useState<boolean>(false);
	const [profs, setProfs] = React.useState<boolean>(false);

	useEffect(() => {
		loadCategories();
		setUnits(false)
		setProfs(false)
		setCosecs(false)
		setHazard('')
	}, [openDialog]);

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

	const onExport = async () => {
		const results = await fetchRoomsForExport(
				env().REACT_APP_GRAPHQL_ENDPOINT_URL,
				oidc.accessToken,
				hazard,
				units,
				cosecs,
				profs
			);
			if ( results.status === 200 && results.data ) {
				const data = parseAndFlatResult(results.data);
				exportToExcel(data, 'labs_export.xlsx');
				save();
			} else {
				console.error('Bad GraphQL results', results);
			}
	};

	const parseAndFlatResult = (hazards: any[]) => {
		const parsedHazards = hazards.map(h => {
			return {
				lab_display: h.lab_display,
				site: h.site,
				building: h.building,
				sector: h.sector,
				floor: h.floor,
				vol: h.vol,
				labType: h.labType,
				cosec: h.cosec,
				email_cosec: h.email_cosec,
				professor: h.professor,
				email_professor: h.email_professor,
				hazard: h.hazard,
				child_submission: h.child_submission ? JSON.parse(h.child_submission).data : {},
				parent_submission: h.parent_submission ? JSON.parse(h.parent_submission).data : {}
			};
		});

		const flatList = parsedHazards.map(lab => {
			const { parent_submission = {}, child_submission = {}, ...rest } = lab;

			const flat =  {
				...rest,
				...parent_submission,
				...child_submission,
			};

			if ('chemical' in flat)
				flat['chemical'] = flat['chemical']['haz_en'];
			else if ('organism' in flat)
				flat['organism'] = flat['organism']['organism'];
			else if ('container' in flat)
				flat['container'] = flat['container']['name'];

			return excludeFields(flat, ['status', 'delete'])
		});

		return flatList;
	}

	function excludeFields(obj: any, fieldsToRemove: string[]) {
		const newObj = { ...obj };
		for (const field of fieldsToRemove) {
			delete newObj[field];
		}
		return newObj;
	}

	return (
		<AlertDialog openDialog={openDialog}
								 onOkClick={onExport}
								 onCancelClick={close}
								 cancelLabel={t('generic.cancelButton')}
								 okLabel={t('generic.saveButton')}
								 title={t('room.exportRoom')}
								 type='selection'
								 isOkDisabled={hazard == '' || (!units && (cosecs || profs))}
		>
			<div style={{display:"flex", flexDirection: "column"}}>
				<Select
					style={{width: '50%', marginRight: "10px"}}
					value={hazard}
					label={t(`hazard.category`)}
					onChange={(event: SelectChangeEvent) => setHazard(event.target.value as string)}
				>
					{categoryList.map(cat => <MenuItem value={cat.hazard_category_name}>{cat.hazard_category_name}</MenuItem>)}
				</Select>
				<FormControlLabel
					control={
						<Switch
							id="units"
							checked={units}
							onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
								setUnits(event.target.checked);
							}}/>
					}
					label={t('room.units')}
				/>
				<FormControlLabel
					control={
						<Switch
							id="cosecs"
							checked={cosecs}
							onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
								setCosecs(event.target.checked);
							}}/>
					}
					label={t('room.cosecs')}
				/>
				<FormControlLabel
					control={
						<Switch
							id="profs"
							checked={profs}
							onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
								setProfs(event.target.checked);
							}}/>
					}
					label={t('room.profs')}
				/>
			</div>
		</AlertDialog>
	);
}
