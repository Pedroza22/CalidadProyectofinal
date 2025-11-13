import { render, screen } from "@testing-library/react";
import Home from "../../src/views/Home";
import { MemoryRouter } from "react-router-dom";

test("Home muestra el encabezado y los módulos", async () => {
  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );

  expect(await screen.findByText(/Selecciona un módulo/i)).toBeTruthy();
  expect(screen.getByText(/Mapa Colombia/i)).toBeTruthy();
  expect(screen.getByText(/Sistema Solar/i)).toBeTruthy();
  expect(screen.getByText(/Pintura 3D/i)).toBeTruthy();
});