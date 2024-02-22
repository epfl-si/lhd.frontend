import React from 'react';
import { Button } from "epfl-elements-react/src/stories/molecules/Button.tsx";
import { FormCard } from "epfl-elements-react/src/stories/molecules/FormCard.tsx";
import biological from "../../../public/pictogrammes/04_Risque biologique.svg"
import chemical from "../../../public/pictogrammes/34_toxique.svg"
import compressedGas from "../../../public/pictogrammes/21_gas bottle flammable.svg"
import cryogenics from "../../../public/pictogrammes/51_liquide_cryogenic.svg"
import electrical from "../../../public/pictogrammes/31_danger electrique.svg"
import eMRadiation from "../../../public/pictogrammes/52_radiation non ionisantes.svg"
import ionisingRadiation from "../../../public/pictogrammes/02_radiation ionisante.svg"
import laser from "../../../public/pictogrammes/03_ rayonnement_laser.svg"
import staticMagneticField from "../../../public/pictogrammes/06_champ magnetique.svg"
import nanoparticles from "../../../public/pictogrammes/05_Risque Nano.svg"
import noise from "../../../public/pictogrammes/54_bruit.svg"
import temperature from "../../../public/pictogrammes/53_basse temperature.svg"

interface HazardCardProps {
  hazardName: string;
  onClick?: (e: React.MouseEvent) => void;
}

export const HazardCard = ({
  hazardName,
  onClick,
  }: HazardCardProps) => {

  let image;
  switch (hazardName) {
    case "Biological":
      image = biological;
      break;
    case "Chemical":
      image = chemical;
      break;
    case "Compressed Gas":
      image = compressedGas;
      break;
    case "Cryogenics":
      image = cryogenics;
      break;
    case "Electrical":
      image = electrical;
      break;
    case "EM Radiation":
      image = eMRadiation;
      break;
    case "Ionising radiation":
      image = ionisingRadiation;
      break;
    case "Laser":
      image = laser;
      break;
    case "Static magnetic field":
      image = staticMagneticField;
      break;
    case "Nanoparticles":
      image = nanoparticles;
      break;
    case "Noise":
      image = noise;
      break;
    case "Temperature":
      image = temperature;
      break;
  }

  return <FormCard key={hazardName.concat("_key")}>
    <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
      <div>
        <img style={{margin: '5px', width: '30px', height: '30px'}}
             src={image}/>
        <strong style={{marginLeft: "10px"}}>
          {hazardName}
        </strong>
      </div>
      <Button size="icon"
              iconName="#arrow-right"
              onClick={onClick}/>
    </div>
  </FormCard>
};
