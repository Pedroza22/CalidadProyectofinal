import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Starfield from "./Starfield";

export default function Layout() {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Contenedor principal */}
      <div className="flex flex-col flex-1">
        {/* Navbar arriba */}
        <Navbar />

      {/* Contenido dinámico (cada vista) */}
      <main className="relative flex-1 overflow-y-auto p-4 bg-gradient-to-b from-[#1a0b2e] via-[#2d1b4e] to-[#4a2c6d]">
          {/* Fondo estrellado común */}
          <Starfield count={160} />
          <div className="relative z-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
