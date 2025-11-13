import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaSun, FaMap, FaPaintBrush, FaHome, FaChevronLeft } from "react-icons/fa";

interface SidebarItem {
  label: string;
  route: string;
  icon?: React.ReactNode;
}

const mainItems: SidebarItem[] = [
  { label: "Mapa Colombia", route: "/mapa-colombia", icon: <FaMap /> },
  { label: "Sistema Solar", route: "/sistema-solar", icon: <FaSun /> },
  { label: "Pintura 3D", route: "/pintura-3d", icon: <FaPaintBrush /> },
];

 

export default function Sidebar() {
  const [openMain, setOpenMain] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const renderNavItem = ({ label, route, icon }: SidebarItem) => (
    <NavLink
      key={route}
      to={route}
      className={({ isActive }) =>
        `w-full text-left flex items-center gap-2 justify-between rounded-lg px-3 py-2 text-[#e7d7ff] 
         hover:bg-white/10 
         ${isActive ? "bg-white/20 ring-2 ring-[#ff6b9d]" : ""}`
      }
    >
      <div className="flex items-center gap-2">{icon} {label}</div>
    </NavLink>
  );

  return (
    <aside className={`hidden md:block ${collapsed ? "md:w-[64px]" : "md:w-[240px]"} border-r border-[#c147e9]/40 bg-gradient-to-b from-[#2d1b4e] to-[#4a2c6d] text-[#e7d7ff]`}>
      <div className="p-3 space-y-1 relative">

        {/* Botón flotante casa cuando está colapsado */}
        {collapsed && (
          <button
            aria-label="Ir a Inicio"
            onClick={() => { navigate("/"); setCollapsed(false); }}
            className="absolute left-2 top-2 inline-flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-[#ff6b9d] to-[#c147e9] text-white shadow hover:from-[#ff5588] hover:to-[#b037d9]"
          >
            <FaHome />
          </button>
        )}

        {/* Acordeón Main Items */}
        {!collapsed && (
          <>
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => setOpenMain(!openMain)}
                className="w-full text-left flex items-center justify-between rounded-lg px-3 py-2 bg-white/10 text-white hover:bg-white/20 font-medium"
              >
                Menú Principal
                <span>{openMain ? "▲" : "▼"}</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  aria-label="Ir a Inicio"
                  onClick={() => navigate("/")}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white/10 text-white hover:bg-white/20"
                >
                  <FaHome />
                </button>
                <button
                  aria-label="Colapsar"
                  onClick={() => setCollapsed(true)}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white/10 text-white hover:bg-white/20"
                >
                  <FaChevronLeft />
                </button>
              </div>
            </div>
            {openMain && <div className="pl-1 space-y-1">{mainItems.map(renderNavItem)}</div>}
          </>
        )}

        

      </div>
    </aside>
  );
}
