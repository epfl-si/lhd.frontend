import * as React from 'react';
import {AlertDialog} from "../global/AlertDialog";
import {hazardFormType} from "../../utils/ressources/types";
import {useTranslation} from "react-i18next";
import {HazardCard} from "./HazardCard";

interface NewHazardChoiseProps {
	availableHazardsInDB: hazardFormType[];
	listSavedCategories: string[];
	onAddHazard?: (hazardName: string) => void;
	onCancelClick?: (visible: boolean) => void;
	openDialog: boolean;
}

export const NewHazardChoise = ({
	availableHazardsInDB,
	listSavedCategories,
	onAddHazard,
	openDialog,
	onCancelClick
}: NewHazardChoiseProps) => {
	const { t } = useTranslation();

	return <AlertDialog openDialog={openDialog}
											onCancelClick={() => {
												if ( onCancelClick ) {
													onCancelClick(false);
												}}}
											cancelLabel={t('generic.cancelButton')}
											okLabel=''>
		<div style={{flexDirection: 'column'}}>
		{availableHazardsInDB.map(h => {
			return !listSavedCategories.includes(h.hazardCategory.hazardCategoryName) ?
				<HazardCard hazardName={h.hazardCategory.hazardCategoryName}
										key={h.hazardCategory.hazardCategoryName}
										onAdd={onAddHazard}
										onCloseNewHazardListDialog={onCancelClick}/> :
				<></>
		})}
	</div>
	</AlertDialog>
}
