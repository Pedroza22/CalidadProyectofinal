import { Routes, Route } from "react-router-dom";
import Layout from "../components/Layout";

// Vistas activas
import HomePage from "../views/HomePage";
import MapaColombia from "../views/MapaColombia";
import SistemaSolar from "../views/SistemaSolar";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="mapa-colombia" element={<MapaColombia />} />
        <Route path="sistema-solar" element={<SistemaSolar />} />
      </Route>
      <Route path="/sistema-solar-full" element={<SistemaSolar />} />
    </Routes>
  );
}
