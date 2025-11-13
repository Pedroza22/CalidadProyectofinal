import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Planet {
  name: string
  size: number
  image: string
  distance: number
  diameter: string
  distanceFromSun: string
  orbitalPeriod: string
  temperature: string
  moons: string
  info: string
  funFact: string
  isDwarf?: boolean
}

const planets: Planet[] = [
  {
    name: "Mercurio",
    size: 50,
    image: "/mercury-planet-realistic.jpg",
    distance: 80,
    diameter: "4,879 km",
    distanceFromSun: "57.9 millones km",
    orbitalPeriod: "88 días",
    temperature: "167°C promedio",
    moons: "0",
    info: "El planeta más pequeño y cercano al Sol. Su superficie está llena de cráteres.",
    funFact: "Un año en Mercurio dura solo 88 días terrestres, pero un día dura 59 días terrestres.",
  },
  {
    name: "Venus",
    size: 65,
    image: "/venus-planet-realistic.jpg",
    distance: 140,
    diameter: "12,104 km",
    distanceFromSun: "108.2 millones km",
    orbitalPeriod: "225 días",
    temperature: "464°C promedio",
    moons: "0",
    info: "El planeta más caliente del sistema solar debido a su atmósfera tóxica de CO₂.",
    funFact: "Venus gira en dirección opuesta a la mayoría de los planetas. El Sol sale por el oeste.",
  },
  {
    name: "Tierra",
    size: 70,
    image: "/earth-planet-realistic-space.jpg",
    distance: 200,
    diameter: "12,742 km",
    distanceFromSun: "149.6 millones km",
    orbitalPeriod: "365.25 días",
    temperature: "15°C promedio",
    moons: "1 (Luna)",
    info: "Nuestro hogar en el universo. El único planeta conocido con vida.",
    funFact: "El 71% de la superficie terrestre está cubierta de agua. Es el planeta más denso del sistema solar.",
  },
  {
    name: "Marte",
    size: 60,
    image: "/mars-red-planet-realistic.jpg",
    distance: 260,
    diameter: "6,779 km",
    distanceFromSun: "227.9 millones km",
    orbitalPeriod: "687 días",
    temperature: "-65°C promedio",
    moons: "2 (Fobos y Deimos)",
    info: "El planeta rojo. Tiene el volcán más grande del sistema solar: Monte Olimpo.",
    funFact: "Un día en Marte dura casi lo mismo que en la Tierra: 24 horas y 37 minutos.",
  },
  {
    name: "Júpiter",
    size: 150,
    image: "/jupiter-gas-giant-planet-realistic.jpg",
    distance: 360,
    diameter: "139,820 km",
    distanceFromSun: "778.5 millones km",
    orbitalPeriod: "12 años",
    temperature: "-110°C promedio",
    moons: "95 lunas conocidas",
    info: "El planeta más grande. Su Gran Mancha Roja es una tormenta gigante.",
    funFact: "Júpiter es tan grande que cabrían más de 1,300 Tierras dentro de él.",
  },
  {
    name: "Saturno",
    size: 140,
    image: "/saturn-planet-rings-realistic.jpg",
    distance: 460,
    diameter: "116,460 km",
    distanceFromSun: "1,434 millones km",
    orbitalPeriod: "29 años",
    temperature: "-140°C promedio",
    moons: "146 lunas conocidas",
    info: "Famoso por sus espectaculares anillos hechos de hielo y roca.",
    funFact: "Saturno es tan ligero que podría flotar en agua si hubiera un océano suficientemente grande.",
  },
  {
    name: "Urano",
    size: 100,
    image: "/uranus-ice-giant-planet-realistic.jpg",
    distance: 540,
    diameter: "50,724 km",
    distanceFromSun: "2,871 millones km",
    orbitalPeriod: "84 años",
    temperature: "-195°C promedio",
    moons: "27 lunas conocidas",
    info: "Un gigante de hielo que gira de lado. Su eje de rotación está muy inclinado.",
    funFact: "Urano gira casi completamente de lado, como una pelota rodando en su órbita.",
  },
  {
    name: "Neptuno",
    size: 95,
    image: "/neptune-blue-planet-realistic.jpg",
    distance: 620,
    diameter: "49,244 km",
    distanceFromSun: "4,495 millones km",
    orbitalPeriod: "165 años",
    temperature: "-200°C promedio",
    moons: "14 lunas conocidas",
    info: "El planeta más alejado. Tiene los vientos más rápidos del sistema solar.",
    funFact: "Los vientos en Neptuno pueden alcanzar velocidades de hasta 2,000 km/h.",
  },
  {
    name: "Plutón",
    size: 40,
    image: "/pluto-dwarf-planet.jpg",
    distance: 720,
    diameter: "2,377 km",
    distanceFromSun: "5,906 millones km",
    orbitalPeriod: "248 años",
    temperature: "-229°C promedio",
    moons: "5 lunas conocidas",
    info: "Antiguamente considerado el noveno planeta. Ahora es clasificado como planeta enano.",
    funFact:
      "Plutón es más pequeño que nuestra Luna. Tarda 248 años terrestres en completar una órbita alrededor del Sol.",
    isDwarf: true,
  },
]

export default function SistemaSolar() {
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null)
  const [stars, setStars] = useState<Array<{ x: number; y: number; size: number; opacity: number }>>([])
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  useEffect(() => {
    const generatedStars = Array.from({ length: 150 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.7 + 0.3,
    }))
    setStars(generatedStars)
  }, [])

  useEffect(() => {
    const checkScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
        setCanScrollLeft(scrollLeft > 0)
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
      }
    }

    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener("scroll", checkScroll)
      checkScroll()
      return () => container.removeEventListener("scroll", checkScroll)
    }
  }, [])

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400
      const newScrollLeft =
        scrollContainerRef.current.scrollLeft + (direction === "right" ? scrollAmount : -scrollAmount)
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      })
    }
  }

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (selectedPlanet) {
        const currentIndex = planets.findIndex((p) => p.name === selectedPlanet.name)
        if (e.key === "ArrowRight" && currentIndex < planets.length - 1) {
          setSelectedPlanet(planets[currentIndex + 1])
        } else if (e.key === "ArrowLeft" && currentIndex > 0) {
          setSelectedPlanet(planets[currentIndex - 1])
        } else if (e.key === "Escape") {
          setSelectedPlanet(null)
        }
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [selectedPlanet])

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-[#1a0b2e] via-[#2d1b4e] to-[#4a2c6d]">
      <div className="fixed inset-0 z-0 pointer-events-none">
        {stars.map((star, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-twinkle"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}

        <div className="absolute top-[15%] right-[20%] w-16 h-16 opacity-70">
          <img src="/meteor-comet-space.jpg" alt="" className="animate-float" />
        </div>
        <div className="absolute bottom-[25%] right-[10%] w-12 h-12 opacity-60">
          <img src="/meteor-shooting-star.jpg" alt="" className="animate-float-slow" />
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-black mb-4 text-balance">
            <span className="bg-gradient-to-r from-[#ffd700] via-[#ff6b9d] to-[#c147e9] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(255,107,157,0.5)]">
              Explora Nuestro Sistema Solar
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-[#e0c3fc] mb-3 font-medium">Un Viaje por los 8 Planetas y Plutón</p>
          <p className="text-base text-[#b8a3d8]">Haz clic en cada planeta para descubrir sus secretos</p>
        </div>

        <div className="bg-gradient-to-r from-[#2d1b4e]/80 to-[#4a2c6d]/80 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-[#8b5cf6]/30">
          <h3 className="text-[#ffd700] font-bold mb-4 text-center text-lg">Navega por los Planetas</h3>
          <div className="flex justify-center gap-3 flex-wrap">
            {planets.map((planet) => (
              <button
                key={planet.name}
                onClick={() => {
                  setSelectedPlanet(planet)
                  const planetElement = document.getElementById(`planet-${planet.name}`)
                  if (planetElement && scrollContainerRef.current) {
                    planetElement.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" })
                  }
                }}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all hover:bg-white/10 ${
                  selectedPlanet?.name === planet.name ? "bg-white/20 ring-2 ring-[#ff6b9d]" : ""
                }`}
              >
                <img
                  src={planet.image || "/placeholder.svg"}
                  alt={planet.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="text-white text-xs font-medium">{planet.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 py-16">
        <div className="container mx-auto px-4">
          <div className="relative">
            {canScrollLeft && (
              <Button
                onClick={() => scroll("left")}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-30 bg-gradient-to-r from-[#ff6b9d] to-[#c147e9] hover:from-[#ff5588] hover:to-[#b037d9] text-white rounded-full w-12 h-12 p-0 shadow-2xl"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
            )}

            {canScrollRight && (
              <Button
                onClick={() => scroll("right")}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-30 bg-gradient-to-r from-[#ff6b9d] to-[#c147e9] hover:from-[#ff5588] hover:to-[#b037d9] text-white rounded-full w-12 h-12 p-0 shadow-2xl"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            )}

            <div
              ref={scrollContainerRef}
              className="relative flex items-center justify-start gap-8 md:gap-12 lg:gap-16 px-8 overflow-x-auto pb-20 scrollbar-hide scroll-smooth"
            >
              <div className="flex-shrink-0 relative group cursor-pointer" onClick={() => setSelectedPlanet(null)}>
                <div className="relative w-40 h-40 md:w-56 md:h-56">
                  <div className="absolute inset-0 rounded-full bg-gradient-radial from-[#ffed4e] via-[#ff9500] to-[#ff5900] animate-pulse-slow" />
                  <div className="absolute -inset-8 rounded-full bg-[#ff9500] opacity-40 blur-3xl animate-pulse-slow" />
                  <div className="absolute -inset-16 rounded-full bg-[#ffed4e] opacity-20 blur-[100px]" />
                  <img
                    src="/sun-star-glowing.jpg"
                    alt="Sol"
                    className="absolute inset-0 w-full h-full rounded-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 text-center">
                  <p className="text-[#ffed4e] font-bold text-2xl whitespace-nowrap drop-shadow-[0_0_10px_rgba(255,237,78,0.8)]">
                    Sol
                  </p>
                  <p className="text-[#ffd700] text-sm font-semibold">Nuestra Estrella</p>
                </div>
              </div>

              {planets.map((planet, index) => (
                <div
                  key={planet.name}
                  id={`planet-${planet.name}`}
                  className="flex-shrink-0 relative group cursor-pointer transition-all duration-500 hover:scale-125 hover:z-20"
                  onClick={() => setSelectedPlanet(planet)}
                  style={{
                    marginLeft: index === 0 ? "0" : `${planet.distance / 10}px`,
                  }}
                >
                  <div
                    className="relative animate-float"
                    style={{
                      width: planet.size,
                      height: planet.size,
                      animationDelay: `${index * 0.5}s`,
                    }}
                  >
                    <img
                      src={planet.image || "/placeholder.svg"}
                      alt={planet.name}
                      className="w-full h-full object-cover rounded-full shadow-2xl drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                    />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
                  </div>

                  <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-center opacity-90 group-hover:opacity-100 transition-all duration-300">
                    <p className="text-white font-bold text-lg md:text-xl whitespace-nowrap drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                      {planet.name}
                    </p>
                    <p className="text-[#e0c3fc] text-xs md:text-sm">{planet.diameter}</p>
                    {planet.isDwarf && (
                      <Badge className="mt-1 bg-[#8b5cf6] text-white text-[10px] px-2 py-0">Planeta Enano</Badge>
                    )}
                  </div>

                  <div className="absolute -top-3 -right-3 w-6 h-6 bg-gradient-to-br from-[#ff6b9d] to-[#c147e9] rounded-full opacity-0 group-hover:opacity-100 transition-opacity animate-pulse shadow-[0_0_15px_rgba(255,107,157,0.8)]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedPlanet && (
        <div className="fixed inset-x-0 bottom-0 z-50 animate-slideUp pointer-events-none">
          <div className="container mx-auto px-4 pb-4 pointer-events-auto">
            <Card className="bg-gradient-to-br from-[#2d1b4e]/98 via-[#4a2c6d]/98 to-[#6b46a3]/98 border-[#c147e9] border-2 backdrop-blur-xl shadow-[0_-10px_50px_rgba(193,71,233,0.3)]">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={selectedPlanet.image || "/placeholder.svg"}
                        alt={selectedPlanet.name}
                        className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover shadow-2xl drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]"
                      />
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
                    </div>
                    <div>
                      <h2 className="text-3xl md:text-5xl font-black mb-2 text-balance">
                        <span className="bg-gradient-to-r from-[#ffd700] via-[#ff6b9d] to-[#c147e9] bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(255,107,157,0.5)]">
                          {selectedPlanet.name}
                        </span>
                      </h2>
                      <Badge className="bg-gradient-to-r from-[#ff6b9d] to-[#c147e9] text-white border-0 text-sm font-bold shadow-lg">
                        {selectedPlanet.isDwarf ? "Planeta Enano" : `Planeta #${planets.indexOf(selectedPlanet) + 1}`}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {planets.findIndex((p) => p.name === selectedPlanet.name) > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          const currentIndex = planets.findIndex((p) => p.name === selectedPlanet.name)
                          setSelectedPlanet(planets[currentIndex - 1])
                        }}
                        className="text-[#e0c3fc] hover:text-white transition-colors text-2xl font-bold px-3 py-2 hover:bg-white/10 rounded-lg"
                      >
                        ←
                      </button>
                    )}
                    {planets.findIndex((p) => p.name === selectedPlanet.name) < planets.length - 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          const currentIndex = planets.findIndex((p) => p.name === selectedPlanet.name)
                          setSelectedPlanet(planets[currentIndex + 1])
                        }}
                        className="text-[#e0c3fc] hover:text-white transition-colors text-2xl font-bold px-3 py-2 hover:bg-white/10 rounded-lg"
                      >
                        →
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedPlanet(null)}
                      className="text-[#e0c3fc] hover:text-white transition-colors text-3xl font-bold px-4 py-2 hover:bg-white/10 rounded-lg"
                    >
                      ×
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-[#4a2c6d]/60 to-[#2d1b4e]/60 p-5 rounded-2xl border border-[#8b5cf6]/30">
                      <h3 className="text-[#ffd700] font-bold mb-3 text-xl flex items-center gap-2">
                        <span className="text-2xl">🪐</span>
                        Descripción
                      </h3>
                      <p className="text-white leading-relaxed text-base">{selectedPlanet.info}</p>
                    </div>

                    <div className="bg-gradient-to-r from-[#ff6b9d]/30 to-[#c147e9]/30 p-5 rounded-2xl border border-[#ff6b9d]/50 shadow-[0_0_20px_rgba(255,107,157,0.2)]">
                      <h3 className="text-[#ffd700] font-bold mb-3 flex items-center gap-2 text-xl">
                        <span className="text-2xl">✨</span>
                        Dato Curioso
                      </h3>
                      <p className="text-white leading-relaxed text-base">{selectedPlanet.funFact}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-[#ffd700] font-bold mb-4 text-xl flex items-center gap-2">
                      <span className="text-2xl">📊</span>
                      Características
                    </h3>
                    <div className="space-y-2">
                      {[
                        { label: "Diámetro", value: selectedPlanet.diameter, emoji: "📏" },
                        { label: "Distancia al Sol", value: selectedPlanet.distanceFromSun, emoji: "🌞" },
                        { label: "Periodo Orbital", value: selectedPlanet.orbitalPeriod, emoji: "⏱️" },
                        { label: "Temperatura", value: selectedPlanet.temperature, emoji: "🌡️" },
                        { label: "Lunas", value: selectedPlanet.moons, emoji: "🌙" },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="flex justify-between items-center p-4 bg-gradient-to-r from-[#4a2c6d]/50 to-[#6b46a3]/50 rounded-xl border border-[#8b5cf6]/40 hover:border-[#c147e9] transition-colors"
                        >
                          <span className="text-[#e0c3fc] flex items-center gap-2 font-medium">
                            <span>{item.emoji}</span>
                            {item.label}:
                          </span>
                          <span className="text-white font-bold">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

