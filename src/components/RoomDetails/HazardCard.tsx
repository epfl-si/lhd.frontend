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
  onOpen?: (hazardName: string) => void;
  onEdit?: (hazardName: string) => void;
  onAdd?: (hazardName: string) => void;
  listSavedCategories: string[];
}

export const HazardCard = ({
  room,
  hazardName,
  backgroundColor,
  onOpen,
  onEdit,
  onAdd,
  listSavedCategories
  }: HazardCardProps) => {
  const { t } = useTranslation();
  const categoriesWithAdditionalInfo = room.hazardAdditionalInfo?.map(h => h.hazard_category?.hazard_category_name);
  const hazardInfo = room.hazardAdditionalInfo?.filter(h => h.hazard_category?.hazard_category_name == hazardName)[0] || {};

  function openAlertDialog (action: string) {
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
  }

  function checkStringValue(value: string | undefined) {
    return (value && value != '') ? value : null;
  }

  return <FormCard key={hazardName.concat("_key")} keyValue={hazardName.concat("_key")}>
    <div style={{backgroundColor: `${backgroundColor}`}} className="displayFlexRow">
      <div className="displayFlexRow">
        <img style={{margin: '5px', width: '30px', height: '30px'}}
             src={getHazardImage(hazardName)}/>
        <strong className="textCard" style={{color: listSavedCategories.includes(hazardName) ? "black" : "gray"}}>
          {t(`hazards.`.concat(hazardName))}
        </strong>
        {(categoriesWithAdditionalInfo && categoriesWithAdditionalInfo.includes(hazardName) && (checkStringValue(hazardInfo.comment) || checkStringValue(hazardInfo.filePath))) ?
          <Button size="icon"
                  iconName={"#twitch"}
                  title={hazardInfo.comment?.concat(hazardInfo.filePath && hazardInfo.filePath != '' ? (" - " + hazardInfo.filePath.split('/').pop()) : '')}
                  onClick={() => {openAlertDialog('Edit');}}/> : <></>
        }
      </div>
      <div className="displayFlexRow" style={{alignItems: 'center'}}>
        {listSavedCategories.includes(hazardName) ?
          <>
            <Button size="icon"
                    iconName={"#edit-3"}
                    onClick={() => {openAlertDialog('Edit');}}/>
            <Button size="icon"
                    iconName={"#eye"}
                    onClick={() => {openAlertDialog('Read');}}
                    style={{marginLeft: '10px'}}/>
          </> :
          <Button size="icon"
                  iconName={"#plus-circle"}
                  onClick={() => {openAlertDialog('Add');}}
                  style={{marginLeft: '10px'}}/>
        }
      </div>
    </div>
  </FormCard>
};
