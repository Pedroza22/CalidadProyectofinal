import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import SistemaSolar from "../../src/views/SistemaSolar";

describe("SistemaSolar", () => {
  test("inicia narración automática al abrir panel", async () => {
    ;(window as any).speechSynthesis = { cancel: jest.fn(), speak: jest.fn() }
    render(<SistemaSolar />)
    fireEvent.click(screen.getAllByText("Mercurio")[0])
    await screen.findByText(/Planeta #1/)
    expect((window as any).speechSynthesis.speak).toHaveBeenCalled()
  })
  beforeEach(() => {
    (Element.prototype as any).scrollIntoView = jest.fn();
  });
  test("renderiza encabezados principales", () => {
    render(<SistemaSolar />);
    expect(screen.getByText("Explora Nuestro Sistema Solar")).toBeInTheDocument();
    expect(screen.getByText("Haz clic en cada planeta para descubrir sus secretos")).toBeInTheDocument();
  });

  test("abre el panel al hacer clic en Mercurio y muestra su badge", () => {
    render(<SistemaSolar />);
    fireEvent.click(screen.getAllByText("Mercurio")[0]);
    expect(screen.getByText(/Planeta #1/)).toBeInTheDocument();
  });

  test("navega con teclado hacia el siguiente planeta y cierra con Escape", () => {
    render(<SistemaSolar />);
    fireEvent.click(screen.getAllByText("Mercurio")[0]);
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(screen.getByText(/Planeta #2/)).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByText("×")).not.toBeInTheDocument();
  });

  test("Plutón muestra badge de Planeta Enano", () => {
    render(<SistemaSolar />);
    fireEvent.click(screen.getAllByText("Plutón")[0]);
    expect(screen.queryAllByText("Planeta Enano").length).toBeGreaterThan(0);
  });

  test("botones de navegación cambian el planeta", () => {
    render(<SistemaSolar />);
    fireEvent.click(screen.getAllByText("Mercurio")[0]);
    const nextBtn = screen.getByText("→");
    fireEvent.click(nextBtn);
    expect(screen.getByText(/Planeta #2/)).toBeInTheDocument();
    const prevBtn = screen.getByText("←");
    fireEvent.click(prevBtn);
    expect(screen.getByText(/Planeta #1/)).toBeInTheDocument();
  });
});
