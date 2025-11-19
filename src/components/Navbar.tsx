// src/components/Navbar.tsx
import React, { useEffect } from "react";
import { FaUser } from "react-icons/fa";

const Navbar: React.FC = () => {
  // Inicializa el tema al cargar
  useEffect(() => {
    const root = document.documentElement;
    const saved = localStorage.getItem("theme");

    if (saved) {
      root.classList.toggle("dark", saved === "dark");
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      root.classList.add("dark");
    }
  }, []);

  // Se elimina el botón de tema según requerimiento.

  return (
    <header className="h-14 sticky top-0 z-10 bg-gradient-to-r from-[#2d1b4e]/80 to-[#4a2c6d]/80 backdrop-blur border-b border-[#c147e9]/40">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        {/* Lado izquierdo: icono de usuario */}
        <div className="flex items-center gap-3">
          <span
            aria-label="Usuario"
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-[#ff6b9d] to-[#c147e9] text-white shadow-[0_0_12px_rgba(193,71,233,0.4)]"
          >
            <FaUser />
          </span>
          <span className="text-[#e7d7ff] font-semibold tracking-wide">Colegio Mentes Creativas</span>
        </div>

        {/* Lado derecho: sin botón de tema */}
        <div className="flex items-center gap-2" />
      </div>
    </header>
  );
};

export default Navbar;
