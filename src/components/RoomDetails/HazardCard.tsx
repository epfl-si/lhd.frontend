import React, {useEffect, useState} from 'react';
import {Button} from "epfl-elements-react/src/stories/molecules/Button.tsx";
import {FormCard} from "epfl-elements-react/src/stories/molecules/FormCard.tsx";
import {getHazardImage} from "./HazardProperties";
import {useTranslation} from "react-i18next";
import {roomDetailsType} from "../../utils/ressources/types";
import {AlertDialog} from "../global/AlertDialog";

interface HazardCardProps {
  room: roomDetailsType;
  hazardName: string;
  backgroundColor: string;
  isDirtyState : boolean;
  onOpen?: (hazardName: string) => void;
  onEdit?: (hazardName: string) => void;
  onAdd?: (hazardName: string) => void;
  setDirtyState: (modified: boolean) => void;
}

export const HazardCard = ({
  room,
  hazardName,
  backgroundColor,
  isDirtyState,
  onOpen,
  onEdit,
  onAdd,
  setDirtyState
  }: HazardCardProps) => {
  const { t } = useTranslation();
  const listSavedCategories = room.hazards.map(h => h.hazard_form_history.hazard_form.hazard_category.hazard_category_name);
  const categoriesWithAdditionalInfo = room.hazardAdditionalInfo.map(h => h.hazard_category.hazard_category_name);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [actionButton, setActionButton] = useState<string>('Read');

  function openAlertDialog (action: string, openDialog: boolean) {
    setActionButton(action);
    if (openDialog) {
      setOpenDialog(true);
    } else {
      setDirtyState(false);
      switch (action) {
        case 'Read' :
          if ( onOpen ) onOpen(hazardName);
          break;
        case 'Edit' :
          if ( onEdit ) onEdit(hazardName);
          break;
        case 'Add' :
          if ( onAdd ) onAdd(hazardName);
          break;
      }
      setOpenDialog(false)
    }
  }

  return <FormCard key={hazardName.concat("_key")} keyValue={hazardName.concat("_key")}>
    <div style={{backgroundColor: `${backgroundColor}`}} className="displayFlexRow">
      <div className="displayFlexRow">
        <img style={{margin: '5px', width: '30px', height: '30px'}}
             src={getHazardImage(hazardName)}/>
        <strong className="textCard" style={{marginRight: '15px', color: listSavedCategories.includes(hazardName) ? "black" : "gray"}}>
          {t(`hazards.`.concat(hazardName))}
        </strong>
        {categoriesWithAdditionalInfo.includes(hazardName) ?
          <Button size="icon"
                  iconName={"#twitch"}
                  onClick={() => {openAlertDialog('Edit', isDirtyState);}}/> : <></>
        }
      </div>
      <div className="displayFlexRow" style={{alignItems: 'center'}}>
        {listSavedCategories.includes(hazardName) ?
          <>
            <Button size="icon"
                    iconName={"#edit-3"}
                    onClick={() => {openAlertDialog('Edit', isDirtyState);}}/>
            <Button size="icon"
                    iconName={"#eye"}
                    onClick={() => {openAlertDialog('Read', isDirtyState);}}
                    style={{marginLeft: '10px'}}/>
          </> :
          <Button size="icon"
                  iconName={"#plus-circle"}
                  onClick={() => {openAlertDialog('Add', isDirtyState);}}
                  style={{marginLeft: '10px'}}/>
        }
      </div>
      <AlertDialog openDialog={openDialog}
                 onOkClick={() => openAlertDialog(actionButton, false)}
                 onCancelClick={() => setOpenDialog(false)}
                 cancelLabel={t('generic.cancelButton')}
                 okLabel={t('generic.continueButton')}
                 title={t('hazard_details.unsavedChangesMessageTitle')}>
        {t('hazard_details.unsavedChangesMessageDescription')}
      </AlertDialog>
    </div>
  </FormCard>
};
