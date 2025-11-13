import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import MapaColombia from "./MapaColombia";

// Mock básico de fetch para inyectar un SVG mínimo con piezas y etiquetas
const mockSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
    <g id="regions">
      <!-- Aseguramos fill y dimensiones suficientes para pasar isRegionShapeInline -->
      <path id="sucre-piece" data-dept="sucre" d="M0 0 L40 0 L40 40 Z" style="fill:#cccccc" />
      <path id="atlantico-piece" data-dept="atlantico" d="M0 0 L40 0 L40 40 Z" style="fill:#cccccc" />
      <path id="bogota-piece" data-dept="bogota" d="M0 0 L40 0 L40 40 Z" style="fill:#cccccc" />
    </g>
    <text id="label-sucre" data-dept="sucre">Sucre</text>
    <text id="label-atlantico" data-dept="atlantico">Atlántico</text>
    <text id="label-bogota" data-dept="bogota">Bogotá</text>
  </svg>
`;

describe("MapaColombia - Interacciones básicas", () => {
  let originalGetBCR: any;
  beforeEach(() => {
    // Mock fetch de SVG
    global.fetch = jest.fn().mockResolvedValue({ ok: true, text: async () => mockSvg }) as any;

    // Polyfills/Mocks de métodos SVG que JSDOM no implementa
    // Dimensiones suficientemente grandes para cumplir area >= 120
    (window.SVGElement.prototype as any).getBBox = () => ({ x: 0, y: 0, width: 40, height: 40 });
    (window.SVGSVGElement.prototype as any).createSVGPoint = () => ({
      x: 0,
      y: 0,
      matrixTransform: () => ({ x: 0, y: 0 })
    });
    (window.SVGSVGElement.prototype as any).getScreenCTM = () => ({ inverse: () => ({ a: 1, d: 1 }) });

    // Forzar dimensiones no-cero para evitar fallback <object>
    originalGetBCR = Element.prototype.getBoundingClientRect;
    (Element.prototype as any).getBoundingClientRect = jest.fn(() => ({
      width: 100,
      height: 100,
      top: 0,
      left: 0,
      right: 100,
      bottom: 100,
      x: 0,
      y: 0,
      toJSON: () => "",
    }));
    Object.defineProperty(window.SVGElement.prototype, "clientWidth", { get: () => 100, configurable: true });
    Object.defineProperty(window.SVGElement.prototype, "clientHeight", { get: () => 100, configurable: true });
    jest.spyOn(window.localStorage, "setItem");
  });

  afterEach(() => {
    jest.restoreAllMocks();
    (Element.prototype as any).getBoundingClientRect = originalGetBCR;
  });

  test("renderiza y carga el SVG con etiquetas de departamentos", async () => {
    render(<MapaColombia />);
    expect(await screen.findByText("Sucre")).toBeInTheDocument();
    expect(screen.getByText("Atlántico")).toBeInTheDocument();
    expect(screen.getByText("Bogotá")).toBeInTheDocument();
    // Verifica que fetch fue llamado a /Colombia.svg
    expect(global.fetch).toHaveBeenCalledWith("/Colombia.svg");
  });

  test("clic en nombre 'Sucre' selecciona su pieza y guarda en localStorage", async () => {
    render(<MapaColombia />);
    const labelSucre = await screen.findByText("Sucre");
    fireEvent.click(labelSucre);

    const sucrePiece = document.getElementById("sucre-piece");
    expect(sucrePiece).toBeTruthy();
    expect(sucrePiece!).toHaveClass("dept-selected");

    // Se debe guardar la selección
    await waitFor(() => {
      expect(window.localStorage.setItem).toHaveBeenCalled();
    });
  });

  // Eliminado: ya no se colorea al hacer clic en la forma; solo al hacer clic en el nombre

  test("clic en nombre 'Bogotá' resalta su etiqueta", async () => {
    render(<MapaColombia />);
    const labelBog = await screen.findByText("Bogotá");
    fireEvent.click(labelBog);
    await waitFor(() => {
      expect(labelBog).toHaveClass("label-selected");
    });
  });
});

describe("MapaColombia - nuevas features: atajos y estado base", () => {
  let originalGetBCR: any;
  beforeEach(() => {
    // Mock fetch de SVG
    global.fetch = jest.fn().mockResolvedValue({ ok: true, text: async () => mockSvg }) as any;

    // Polyfills/Mocks SVG
    (window.SVGElement.prototype as any).getBBox = () => ({ x: 0, y: 0, width: 40, height: 40 });
    (window.SVGSVGElement.prototype as any).createSVGPoint = () => ({
      x: 0,
      y: 0,
      matrixTransform: () => ({ x: 0, y: 0 })
    });
    (window.SVGSVGElement.prototype as any).getScreenCTM = () => ({ inverse: () => ({ a: 1, d: 1 }) });

    originalGetBCR = Element.prototype.getBoundingClientRect;
    (Element.prototype as any).getBoundingClientRect = jest.fn(() => ({
      width: 100,
      height: 100,
      top: 0,
      left: 0,
      right: 100,
      bottom: 100,
      x: 0,
      y: 0,
      toJSON: () => "",
    }));
    Object.defineProperty(window.SVGElement.prototype, "clientWidth", { get: () => 100, configurable: true });
    Object.defineProperty(window.SVGElement.prototype, "clientHeight", { get: () => 100, configurable: true });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    (Element.prototype as any).getBoundingClientRect = originalGetBCR;
  });

  // Helpers eliminados: las pruebas de arrastre se cubren unitariamente en panUtils.test.ts

  test("Muestra instrucción de atajos: Reset con R o doble clic", async () => {
    render(<MapaColombia />);
    expect(await screen.findByText(/Reset: R o doble clic/i)).toBeInTheDocument();
  });

  // Nota: las pruebas de arrastre y sensibilidad se cubren unitariamente en panUtils.test.ts
});