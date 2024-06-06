import biological from "../../../public/pictogrammes/04_Risque_biologique.svg"
import chemical from "../../../public/pictogrammes/34_toxique.svg"
import compressedGas from "../../../public/pictogrammes/21_gas bottle flammable.svg"
import cryogenics from "../../../public/pictogrammes/51_liquide_cryogenic.svg"
import electrical from "../../../public/pictogrammes/31_danger electrique.svg"
import eMRadiation from "../../../public/pictogrammes/52_radiation non ionisantes.svg"
import ionisingRadiation from "../../../public/pictogrammes/02_radiation_ionisante.svg"
import laser from "../../../public/pictogrammes/03_ rayonnement_laser.svg"
import staticMagneticField from "../../../public/pictogrammes/06_champ magnetique.svg"
import nanoparticles from "../../../public/pictogrammes/05_Risque_Nano.svg"
import noise from "../../../public/pictogrammes/54_bruit.svg"
import temperature from "../../../public/pictogrammes/53_basse temperature.svg"

export function getHazardImage(hazardName: string) {
  let image;
  switch (hazardName) {
    case "Biological":
      image = biological;
      break;
    case "Chemical":
      image = chemical;
      break;
    case "CompressedGas":
      image = compressedGas;
      break;
    case "Cryogenics":
      image = cryogenics;
      break;
    case "Electrical":
      image = electrical;
      break;
    case "TimeVaryingEMF":
      image = eMRadiation;
      break;
    case "IonisingRadiation":
      image = ionisingRadiation;
      break;
    case "Laser":
      image = laser;
      break;
    case "Nanoparticles":
      image = nanoparticles;
      break;
    case "Noise":
      image = noise;
      break;
    case "StaticMagneticField":
      image = staticMagneticField;
      break;
    case "Temperature":
      image = temperature;
      break;
  }
  return image;
}
