export type RegionInfo = {
  id: "Caribe" | "Pacífica" | "Andina" | "Orinoquía" | "Amazonía" | "Insular";
  nombre: string;
  capitalReferente: string;
  poblacionAprox: number;
  idioma: string;
  superficieKm2: number;
  economiaClave: string;
};

export const regiones3D: RegionInfo[] = [
  {
    id: "Caribe",
    nombre: "Región Caribe",
    capitalReferente: "Barranquilla",
    poblacionAprox: 8000000,
    idioma: "Español",
    superficieKm2: 132288,
    economiaClave: "Comercio, turismo y puertos",
  },
  {
    id: "Pacífica",
    nombre: "Región Pacífica",
    capitalReferente: "Cali",
    poblacionAprox: 5400000,
    idioma: "Español",
    superficieKm2: 82500,
    economiaClave: "Industria, pesca y biodiversidad",
  },
  {
    id: "Andina",
    nombre: "Región Andina",
    capitalReferente: "Bogotá",
    poblacionAprox: 25000000,
    idioma: "Español",
    superficieKm2: 282540,
    economiaClave: "Servicios, industria y agricultura",
  },
  {
    id: "Orinoquía",
    nombre: "Región Orinoquía",
    capitalReferente: "Villavicencio",
    poblacionAprox: 1800000,
    idioma: "Español",
    superficieKm2: 259000,
    economiaClave: "Ganadería y hidrocarburos",
  },
  {
    id: "Amazonía",
    nombre: "Región Amazonía",
    capitalReferente: "Leticia",
    poblacionAprox: 500000,
    idioma: "Español (diversidad indígena)",
    superficieKm2: 483000,
    economiaClave: "Conservación y ecoturismo",
  },
  {
    id: "Insular",
    nombre: "Región Insular",
    capitalReferente: "San Andrés",
    poblacionAprox: 80000,
    idioma: "Español",
    superficieKm2: 52,
    economiaClave: "Turismo y comercio",
  },
];