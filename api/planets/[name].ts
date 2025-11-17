import type { IncomingMessage, ServerResponse } from "http"

const planets = [
  { name: "Mercurio", size: 50, image: "/mercury-planet-realistic.jpg", distance: 80, diameter: "4,879 km", distanceFromSun: "57.9 millones km", orbitalPeriod: "88 días", temperature: "167°C promedio", moons: "0", info: "El planeta más pequeño y cercano al Sol. Su superficie está llena de cráteres.", funFact: "Un año en Mercurio dura solo 88 días terrestres, pero un día dura 59 días terrestres." },
  { name: "Venus", size: 65, image: "/venus-planet-realistic.jpg", distance: 140, diameter: "12,104 km", distanceFromSun: "108.2 millones km", orbitalPeriod: "225 días", temperature: "464°C promedio", moons: "0", info: "El planeta más caliente del sistema solar debido a su atmósfera tóxica de CO₂.", funFact: "Venus gira en dirección opuesta a la mayoría de los planetas. El Sol sale por el oeste." },
  { name: "Tierra", size: 70, image: "/earth-planet-realistic-space.jpg", distance: 200, diameter: "12,742 km", distanceFromSun: "149.6 millones km", orbitalPeriod: "365.25 días", temperature: "15°C promedio", moons: "1 (Luna)", info: "Nuestro hogar en el universo. El único planeta conocido con vida.", funFact: "El 71% de la superficie terrestre está cubierta de agua. Es el planeta más denso del sistema solar." },
  { name: "Marte", size: 60, image: "/mars-red-planet-realistic.jpg", distance: 260, diameter: "6,779 km", distanceFromSun: "227.9 millones km", orbitalPeriod: "687 días", temperature: "-65°C promedio", moons: "2 (Fobos y Deimos)", info: "El planeta rojo. Tiene el volcán más grande del sistema solar: Monte Olimpo.", funFact: "Un día en Marte dura casi lo mismo que en la Tierra: 24 horas y 37 minutos." },
  { name: "Júpiter", size: 150, image: "/jupiter-gas-giant-planet-realistic.jpg", distance: 360, diameter: "139,820 km", distanceFromSun: "778.5 millones km", orbitalPeriod: "12 años", temperature: "-110°C promedio", moons: "95 lunas conocidas", info: "El planeta más grande. Su Gran Mancha Roja es una tormenta gigante.", funFact: "Júpiter es tan grande que cabrían más de 1,300 Tierras dentro de él." },
  { name: "Saturno", size: 140, image: "/saturn-planet-rings-realistic.jpg", distance: 460, diameter: "116,460 km", distanceFromSun: "1,434 millones km", orbitalPeriod: "29 años", temperature: "-140°C promedio", moons: "146 lunas conocidas", info: "Famoso por sus espectaculares anillos hechos de hielo y roca.", funFact: "Saturno es tan ligero que podría flotar en agua si hubiera un océano suficientemente grande." },
  { name: "Urano", size: 100, image: "/uranus-ice-giant-planet-realistic.jpg", distance: 540, diameter: "50,724 km", distanceFromSun: "2,871 millones km", orbitalPeriod: "84 años", temperature: "-195°C promedio", moons: "27 lunas conocidas", info: "Un gigante de hielo que gira de lado. Su eje de rotación está muy inclinado.", funFact: "Urano gira casi completamente de lado, como una pelota rodando en su órbita." },
  { name: "Neptuno", size: 95, image: "/neptune-blue-planet-realistic.jpg", distance: 620, diameter: "49,244 km", distanceFromSun: "4,495 millones km", orbitalPeriod: "165 años", temperature: "-200°C promedio", moons: "14 lunas conocidas", info: "El planeta más alejado. Tiene los vientos más rápidos del sistema solar.", funFact: "Los vientos en Neptuno pueden alcanzar velocidades de hasta 2,000 km/h." },
  { name: "Plutón", size: 40, image: "/pluto-dwarf-planet.jpg", distance: 720, diameter: "2,377 km", distanceFromSun: "5,906 millones km", orbitalPeriod: "248 años", temperature: "-229°C promedio", moons: "5 lunas conocidas", info: "Antiguamente considerado el noveno planeta. Ahora es clasificado como planeta enano.", funFact: "Plutón es más pequeño que nuestra Luna. Tarda 248 años terrestres en completar una órbita alrededor del Sol.", isDwarf: true },
];

export default async function handler(req: IncomingMessage & { query?: any; url?: string }, res: ServerResponse & { setHeader: Function; status: Function; send: Function }) {
  const url = req.url || "";
  const name = decodeURIComponent(url.split("/api/planets/")[1] || "");
  const planet = planets.find((p) => p.name.toLowerCase() === name.toLowerCase());
  if (!planet) {
    res.setHeader("Content-Type", "application/json");
    res.status(404).send(JSON.stringify({ error: "Not Found" }));
    return;
  }
  res.setHeader("Content-Type", "application/json");
  res.status(200).send(JSON.stringify(planet));
}
