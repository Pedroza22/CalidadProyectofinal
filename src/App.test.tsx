import { render, screen } from "@testing-library/react";
import App from "./App";

test("renderiza la vista inicial del mapa", async () => {
  render(<App />);
  // La vista por defecto es MapaColombia y muestra el título "Explora Colombia"
  expect(await screen.findByText(/Explora Colombia/i)).toBeInTheDocument();
});