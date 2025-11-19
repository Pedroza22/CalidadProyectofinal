import { Link } from "react-router-dom";
import Starfield from "../components/Starfield";

export default function Home() {
  const modules = [
    {
      key: "mapa",
      title: "Mapa Colombia",
      to: "/mapa-colombia",
      desc: "Explora departamentos y datos curiosos del país.",
      emoji: "🗺️",
    },
    {
      key: "solar",
      title: "Sistema Solar",
      to: "/sistema-solar",
      desc: "Navega por planetas y descubre sus características.",
      emoji: "🌌",
    },
    {
      key: "pintura",
      title: "Pintura 3D",
      to: "/pintura-3d",
      desc: "Crea arte con efectos y colores vibrantes.",
      emoji: "🎨",
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-[#1a0b2e] via-[#2d1b4e] to-[#4a2c6d]">
      <Starfield />
      <div className="relative z-10 container mx-auto px-4 py-8 text-[#e7d7ff]">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-black mb-2 text-balance">
            <span className="bg-gradient-to-r from-[#ffd700] via-[#ff6b9d] to-[#c147e9] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(255,107,157,0.5)]">
              ¡Bienvenido! Elije tu aventura✨
            </span>
          </h1>
          <p className="text-lg text-[#e0c3fc]">Toca un botón para empezar tu aventura.</p>
          <p className="text-sm text-[#b8a3d8] mt-1">Aprende sobre Colombia, el espacio y el arte de una forma divertida.</p>
          <div className="mt-8 flex justify-center">
            <div className="relative inline-flex items-center justify-center animate-bounce">
              <img
                src="/earth-cute.svg"
                alt="Planeta Tierra"
                className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-full animate-spin-slow"
              />
              <span className="gradient-ring" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#2d1b4e]/80 to-[#4a2c6d]/80 backdrop-blur-sm rounded-2xl p-6 border border-[#8b5cf6]/30">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((m) => (
              <Link
                key={m.key}
                to={m.to}
                className="group rounded-xl p-4 bg-white/5 hover:bg-white/10 transition border border-[#c147e9]/30 hover:border-[#ff6b9d]/50 shadow hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="text-3xl">{m.emoji}</div>
                  <div className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-sm text-white bg-gradient-to-r from-[#ff6b9d] to-[#c147e9] group-hover:from-[#ff5588] group-hover:to-[#b037d9]">
                    Abrir
                  </div>
                </div>
                <h2 className="mt-3 text-xl font-bold">{m.title}</h2>
                <p className="mt-1 text-sm text-[#b8a3d8]">{m.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}