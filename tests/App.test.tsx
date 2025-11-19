import { render, screen } from "@testing-library/react";
import App from "../src/App";

test("renderiza la vista inicial Home con tarjetas de módulos", async () => {
  render(<App />);
  // La vista por defecto es Home y muestra el encabezado de bienvenida
  expect(await screen.findByText(/Bienvenido/i)).toBeTruthy();
});