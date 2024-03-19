import React from 'react';
import {Button} from "epfl-elements-react/src/stories/molecules/Button.tsx";
import {FormCard} from "epfl-elements-react/src/stories/molecules/FormCard.tsx";
import {getHazardImage} from "./HazardProperties";
import {useTranslation} from "react-i18next";
import {roomDetailsType} from "../../utils/ressources/types";

interface HazardCardProps {
  room: roomDetailsType;
  hazardName: string;
  onEditMode : boolean;
  onOpen?: (hazardName: string) => void;
  onEdit?: (hazardName: string) => void;
  onAdd?: (hazardName: string) => void;
}

export const HazardCard = ({
  room,
  hazardName,
  onEditMode,
  onOpen,
  onEdit,
  onAdd
  }: HazardCardProps) => {
  const { t } = useTranslation();
  const listSavedCategories = room.hazards.map(h => h.hazard_form_history.hazard_form.hazard_category.hazard_category_name);

  //dirtyState

  return <FormCard key={hazardName.concat("_key")} keyValue={hazardName.concat("_key")}>
    <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
      <div>
        <img style={{margin: '5px', width: '30px', height: '30px'}}
             src={getHazardImage(hazardName)}/>
        <strong className="textCard" style={{color: listSavedCategories.includes(hazardName) ? "black" : "gray"}}>
          {t(`hazards.`.concat(hazardName))}
        </strong>
      </div>
        <div className="displayFlexRow" style={{alignItems: 'center'}}>
          {listSavedCategories.includes(hazardName) ?
          <>
            <Button size="icon"
                  iconName={"#plus-circle"}
                  onClick={() => {
                    if ( onAdd ) onAdd(hazardName);
                  }}/>
            <Button size="icon"
                  iconName={"#edit-3"}
                  onClick={() => {
                    if ( onEdit ) onEdit(hazardName);
                  }}/>
            <Button size="icon"
                iconName={"#eye"}
                  onClick={() => {
                    if ( onOpen ) onOpen(hazardName);
                  }}
                style={{marginLeft: '10px'}}/>
          </>:
            <Button size="icon"
                iconName={"#plus-circle"}
                onClick={() => {
                  if ( onAdd ) onAdd(hazardName);
                }}
                style={{marginLeft: '10px'}}/>
          }
        </div>
    </div>
  </FormCard>
};
