import { Routes, Route } from "react-router-dom";
import Layout from "../components/Layout";

// Vistas activas
import MapaColombia from "../views/MapaColombia";
import SistemaSolar from "../views/SistemaSolar";
import Pintura3D from "../views/Pintura3D";
import Home from "../views/Home";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}> 
        <Route index element={<Home />} />
        <Route path="mapa-colombia" element={<MapaColombia />} />
        <Route path="sistema-solar" element={<SistemaSolar />} />
        <Route path="pintura-3d" element={<Pintura3D />} />
        <Route path="inicio" element={<Home />} />
      </Route>
      <Route path="/sistema-solar-full" element={<SistemaSolar />} />
    </Routes>
  );
}
