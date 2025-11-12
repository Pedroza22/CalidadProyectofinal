export type Departamento = {
  id: string; // slug sencillo
  nombre: string;
  capital: string;
  region: "Caribe" | "Pacífica" | "Andina" | "Orinoquía" | "Amazonía" | "Insular";
  poblacionAprox?: number; // opcional, habitantes
};

export const departamentos: Departamento[] = [
  { id: "antioquia", nombre: "Antioquia", capital: "Medellín", region: "Andina", poblacionAprox: 6500000 },
  { id: "valle", nombre: "Valle del Cauca", capital: "Cali", region: "Pacífica", poblacionAprox: 4500000 },
  { id: "cundinamarca", nombre: "Cundinamarca", capital: "Bogotá", region: "Andina", poblacionAprox: 3000000 },
  { id: "atlantico", nombre: "Atlántico", capital: "Barranquilla", region: "Caribe", poblacionAprox: 2600000 },
  { id: "bolivar", nombre: "Bolívar", capital: "Cartagena", region: "Caribe", poblacionAprox: 2100000 },
  { id: "magdalena", nombre: "Magdalena", capital: "Santa Marta", region: "Caribe", poblacionAprox: 1300000 },
  { id: "santander", nombre: "Santander", capital: "Bucaramanga", region: "Andina", poblacionAprox: 2200000 },
  { id: "norte_santander", nombre: "Norte de Santander", capital: "Cúcuta", region: "Andina", poblacionAprox: 1600000 },
  { id: "boyaca", nombre: "Boyacá", capital: "Tunja", region: "Andina", poblacionAprox: 1200000 },
  { id: "quindio", nombre: "Quindío", capital: "Armenia", region: "Andina", poblacionAprox: 600000 },
  { id: "risaralda", nombre: "Risaralda", capital: "Pereira", region: "Andina", poblacionAprox: 1000000 },
  { id: "caldas", nombre: "Caldas", capital: "Manizales", region: "Andina", poblacionAprox: 1000000 },
  { id: "tolima", nombre: "Tolima", capital: "Ibagué", region: "Andina", poblacionAprox: 1400000 },
  { id: "huila", nombre: "Huila", capital: "Neiva", region: "Andina", poblacionAprox: 1300000 },
  { id: "bogota", nombre: "Bogotá D.C.", capital: "Bogotá", region: "Andina", poblacionAprox: 8000000 },
  { id: "narinio", nombre: "Nariño", capital: "Pasto", region: "Pacífica", poblacionAprox: 1600000 },
  { id: "choco", nombre: "Chocó", capital: "Quibdó", region: "Pacífica", poblacionAprox: 550000 },
  { id: "cauca", nombre: "Cauca", capital: "Popayán", region: "Pacífica", poblacionAprox: 1500000 },
  { id: "cesar", nombre: "Cesar", capital: "Valledupar", region: "Caribe", poblacionAprox: 1200000 },
  { id: "cordoba", nombre: "Córdoba", capital: "Montería", region: "Caribe", poblacionAprox: 1700000 },
  { id: "sucre", nombre: "Sucre", capital: "Sincelejo", region: "Caribe", poblacionAprox: 900000 },
  { id: "guajira", nombre: "La Guajira", capital: "Riohacha", region: "Caribe", poblacionAprox: 1000000 },
  { id: "arauca", nombre: "Arauca", capital: "Arauca", region: "Orinoquía", poblacionAprox: 300000 },
  { id: "casanare", nombre: "Casanare", capital: "Yopal", region: "Orinoquía", poblacionAprox: 450000 },
  { id: "meta", nombre: "Meta", capital: "Villavicencio", region: "Orinoquía", poblacionAprox: 1100000 },
  { id: "vichada", nombre: "Vichada", capital: "Puerto Carreño", region: "Orinoquía", poblacionAprox: 120000 },
  { id: "guaviare", nombre: "Guaviare", capital: "San José del Guaviare", region: "Orinoquía", poblacionAprox: 250000 },
  { id: "guainia", nombre: "Guainía", capital: "Inírida", region: "Amazonía", poblacionAprox: 50000 },
  { id: "vaupes", nombre: "Vaupés", capital: "Mitú", region: "Amazonía", poblacionAprox: 45000 },
  { id: "caqueta", nombre: "Caquetá", capital: "Florencia", region: "Amazonía", poblacionAprox: 420000 },
  { id: "amazonas", nombre: "Amazonas", capital: "Leticia", region: "Amazonía", poblacionAprox: 80000 },
  { id: "putumayo", nombre: "Putumayo", capital: "Mocoa", region: "Amazonía", poblacionAprox: 350000 },
  { id: "san_andres", nombre: "San Andrés y Providencia", capital: "San Andrés", region: "Insular", poblacionAprox: 80000 },
];

export const actividadesPorRegion: Record<Departamento["region"], string[]> = {
  Caribe: [
    "Identifica tradiciones y ritmos del Caribe",
    "Ubica puertos y actividades económicas costeras",
  ],
  Pacífica: [
    "Explora biodiversidad y selvas húmedas",
    "Reconoce comunidades afrodescendientes y su cultura",
  ],
  Andina: [
    "Ubica cordilleras y pisos térmicos",
    "Analiza urbanización e industria en ciudades principales",
  ],
  Orinoquía: [
    "Describe llanos y ganadería",
    "Relaciona ríos y transporte fluvial",
  ],
  Amazonía: [
    "Investiga pueblos indígenas y conservación",
    "Reconoce el rol del bosque tropical",
  ],
  Insular: [
    "Ubica archipiélagos y actividades turísticas",
    "Analiza la protección de ecosistemas coralinos",
  ],
};