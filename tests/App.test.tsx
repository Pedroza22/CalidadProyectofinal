import { render, screen } from "@testing-library/react";
import App from "../src/App";

test("renderiza la vista inicial Home con tarjetas de módulos", async () => {
  render(<App />);
  // La vista por defecto es Home y muestra el encabezado "Selecciona un módulo"
  expect(await screen.findByText(/Selecciona un módulo/i)).toBeTruthy();
});