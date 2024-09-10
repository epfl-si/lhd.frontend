import biological from "../../../public/pictogrammes/Biological.svg"
import chemical from "../../../public/pictogrammes/Chemical.svg"
import compressedGas from "../../../public/pictogrammes/CompressedGas.svg"
import cryogenics from "../../../public/pictogrammes/Cryogenics.svg"
import electrical from "../../../public/pictogrammes/Electrical.svg"
import eMRadiation from "../../../public/pictogrammes/TimeVaryingEMF.svg"
import ionisingRadiation from "../../../public/pictogrammes/IonisingRadiation.svg"
import laser from "../../../public/pictogrammes/Laser.svg"
import staticMagneticField from "../../../public/pictogrammes/StaticMagneticField.svg"
import nanoparticles from "../../../public/pictogrammes/Nanoparticles.svg"
import noise from "../../../public/pictogrammes/Noise.svg"
import temperature from "../../../public/pictogrammes/Temperature.svg"
import incoherentLightSource from "../../../public/pictogrammes/IncoherentLightSource.svg"

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
    case "IncoherentLightSource":
      image = incoherentLightSource;
      break;
  }
  return image;
}
