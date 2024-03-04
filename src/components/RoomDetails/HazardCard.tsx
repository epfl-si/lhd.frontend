import React from 'react';
import { Button } from "epfl-elements-react/src/stories/molecules/Button.tsx";
import { FormCard } from "epfl-elements-react/src/stories/molecules/FormCard.tsx";
import {getHazardImage} from "./HazardProperties";
import {t} from "i18next";
import {useTranslation} from "react-i18next";

interface HazardCardProps {
  listSavedCategories: string[];
  hazardName: string;
  onClick?: (e: React.MouseEvent) => void;
}

export const HazardCard = ({
  listSavedCategories,
  hazardName,
  onClick,
  }: HazardCardProps) => {
  const { t } = useTranslation();

  return <FormCard key={hazardName.concat("_key")} keyValue={hazardName.concat("_key")}>
    <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
      <div>
        <img style={{margin: '5px', width: '30px', height: '30px'}}
             src={getHazardImage(hazardName)}/>
        <strong style={{marginLeft: "10px", color: listSavedCategories.includes(hazardName) ? "black" : "gray"}}>
          {t(`hazards.`.concat(hazardName))}
        </strong>
      </div>
      <Button size="icon"
              iconName={listSavedCategories.includes(hazardName) ? "#arrow-right" : "#plus-circle"}
              onClick={onClick}/>
    </div>
  </FormCard>
};
