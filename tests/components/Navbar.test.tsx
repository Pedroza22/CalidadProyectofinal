import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Navbar from "../../src/components/Navbar";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Navbar - Renderizado", () => {
  test("muestra el icono de usuario", () => {
    render(<Navbar />);
    expect(screen.getByLabelText(/Usuario/i)).toBeInTheDocument();
  });

  test("no muestra el botón de tema", () => {
    render(<Navbar />);
    expect(screen.queryByRole("button", { name: /Tema/i })).toBeNull();
  });
});