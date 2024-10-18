import React from 'react';
import {Button} from "epfl-elements-react/src/stories/molecules/Button.tsx";
import {FormCard} from "epfl-elements-react/src/stories/molecules/FormCard.tsx";
import {getHazardImage} from "./HazardProperties";
import {useTranslation} from "react-i18next";

interface HazardCardProps {
  hazardName: string;
  onAdd?: (hazardName: string) => void;
  onCloseNewHazardListDialog?: (visible: boolean) => void;
}

export const HazardCard = ({
  hazardName,
  onAdd,
  onCloseNewHazardListDialog
  }: HazardCardProps) => {
  const { t } = useTranslation();

  function openAlertDialog () {
    if ( onAdd ) onAdd(hazardName);
    if (onCloseNewHazardListDialog) onCloseNewHazardListDialog(false);
  }

  return <FormCard key={hazardName.concat("_key")} keyValue={hazardName.concat("_key")}>
    <div className="displayFlexRow">
      <div className="displayFlexRow">
        <img style={{margin: '5px', width: '30px', height: '30px'}}
             src={getHazardImage(hazardName)}/>
        <strong className="textCard" style={{color: "gray"}}>
          {t(`hazards.`.concat(hazardName))}
        </strong>
      </div>
      <div className="displayFlexRow" style={{alignItems: 'center'}}>
        <Button size="icon"
                iconName={"#plus-circle"}
                onClick={() => {openAlertDialog()}}
                style={{marginLeft: '10px'}}/>
      </div>
    </div>
  </FormCard>
};
