import { render, screen, fireEvent, within } from "@testing-library/react"
import "@testing-library/jest-dom"

jest.mock("three", () => {
  const canvas = typeof document !== "undefined" ? document.createElement("canvas") : ({ addEventListener: () => {} } as any)
  return {
    Color: jest.fn().mockImplementation(() => ({})),
    PerspectiveCamera: jest.fn().mockImplementation(() => ({ position: { set: jest.fn() }, aspect: 1, updateProjectionMatrix: jest.fn() })),
    Scene: jest.fn().mockImplementation(() => ({ add: jest.fn(), background: null })),
    AmbientLight: jest.fn(),
    DirectionalLight: jest.fn().mockImplementation(() => ({ position: { set: jest.fn() } })),
    PlaneGeometry: jest.fn(),
    MeshStandardMaterial: jest.fn().mockImplementation(() => ({ color: { clone: jest.fn(), offsetHSL: jest.fn() } })),
    MeshBasicMaterial: jest.fn(),
    Mesh: jest.fn().mockImplementation(() => ({ rotation: { x: 0 }, position: { y: 0, set: jest.fn(), copy: jest.fn() }, quaternion: { copy: jest.fn() }, material: { color: { clone: jest.fn() } } })),
    WebGLRenderer: jest.fn().mockImplementation(() => ({ setPixelRatio: jest.fn(), setSize: jest.fn(), render: jest.fn(), dispose: jest.fn(), domElement: canvas })),
    Raycaster: jest.fn().mockImplementation(() => ({ setFromCamera: jest.fn(), intersectObject: jest.fn(() => []) })),
    BufferGeometry: jest.fn().mockImplementation(() => ({ setAttribute: jest.fn() })),
    BufferAttribute: jest.fn(),
    PointsMaterial: jest.fn(),
    Points: jest.fn(),
    SpriteMaterial: jest.fn(),
    Sprite: jest.fn().mockImplementation(() => ({ scale: { set: jest.fn() }, position: { set: jest.fn() } })),
    CircleGeometry: jest.fn(),
    TubeGeometry: jest.fn(),
    CatmullRomCurve3: jest.fn(),
    SphereGeometry: jest.fn(),
    BoxGeometry: jest.fn(),
    Vector2: jest.fn(),
    Vector3: jest.fn().mockImplementation(() => ({ clone: jest.fn(), x: 0, y: 0, z: 0 })),
    AdditiveBlending: 1,
    DoubleSide: 2,
  }
})

import Pintura3D from "../../src/views/Pintura3D"

jest.mock("three/examples/jsm/controls/OrbitControls.js", () => ({
  OrbitControls: function () { return { update: jest.fn(), dispose: jest.fn() } },
}))

describe("Pintura3D", () => {
  let mockSpeak: jest.Mock

  beforeEach(() => {
    mockSpeak = jest.fn()
    ;(global as any).SpeechSynthesisUtterance = class {
      text: string
      lang = ""
      rate = 1
      pitch = 1
      volume = 1
      voice: any = null
      constructor(t: string) { this.text = t }
    }
    ;(window as any).speechSynthesis = {
      getVoices: jest.fn(() => [{ lang: "es-MX", name: "Mexico" }]),
      onvoiceschanged: null,
      speak: mockSpeak,
      cancel: jest.fn(),
    }
    jest.spyOn(window, "requestAnimationFrame").mockImplementation(() => 0 as any)
  })

  afterEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
  })

  test("muestra el título principal", () => {
    render(<Pintura3D />)
    expect(screen.getByText("PintaColor3D")).toBeInTheDocument()
  })

  test("cambia herramienta al hacer clic y anuncia voz", () => {
    render(<Pintura3D />)
    fireEvent.click(screen.getByText("Spray"))
    const summaryGrid = screen.getByText("Trazos").parentElement!.parentElement as HTMLElement
    expect(within(summaryGrid).getByText("Spray")).toBeInTheDocument()
    expect(mockSpeak).toHaveBeenCalled()
    const utter = mockSpeak.mock.calls[0][0]
    expect((utter as any).text).toMatch(/Elegiste Spray/)
    expect((utter as any).lang).toBe("es-MX")
  })

  test("selecciona un color y anuncia voz", () => {
    render(<Pintura3D />)
    const btns = Array.from(document.querySelectorAll("button")) as HTMLElement[]
    const swatches = btns.filter((b) => !!b.style.backgroundColor)
    const target = swatches[1]
    fireEvent.click(target)
    expect(target).toHaveClass("ring-2")
    const utter = mockSpeak.mock.calls[mockSpeak.mock.calls.length - 1][0]
    expect((utter as any).text).toMatch(/^Color /)
    expect((utter as any).lang).toBe("es-MX")
  })

  test("bloquea y desbloquea movimiento con feedback de voz", () => {
    render(<Pintura3D />)
    const btn = screen.getByText("Bloquear movimiento")
    fireEvent.click(btn)
    expect(screen.getByText("Desbloquear movimiento")).toBeInTheDocument()
    const utter = mockSpeak.mock.calls[mockSpeak.mock.calls.length - 1][0]
    expect((utter as any).text).toMatch(/Movimiento bloqueado/)
  })
})