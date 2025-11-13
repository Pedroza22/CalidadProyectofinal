import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { Button } from "../components/ui/button"
import { FaPencilAlt, FaPaintBrush, FaSprayCan, FaHighlighter, FaEraser, FaMagic, FaTint, FaChessBoard, FaLock, FaLockOpen, FaUndo, FaTrashAlt, FaSave } from "react-icons/fa"
import { Card, CardContent } from "../components/ui/card"

type Tool = "brush" | "pencil" | "spray" | "marker" | "watercolor" | "glow" | "eraser" | "textured"

const toolLabels: Record<Tool, string> = {
  pencil: "Detalle fino",
  watercolor: "Suave",
  brush: "Base",
  textured: "Texturizado",
  spray: "Spray",
  glow: "Efecto",
  marker: "Marcador",
  eraser: "Goma",
}

export default function Pintura3D() {
  const stageRef = useRef<HTMLDivElement | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const planeRef = useRef<THREE.Mesh | null>(null)
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster())
  const drawingRef = useRef(false)
  const currentStrokeRef = useRef<THREE.Group | null>(null)
  const lastPointRef = useRef<THREE.Vector3 | null>(null)
  const [tool, setTool] = useState<Tool>("brush")
  const [color, setColor] = useState<string>("#c147e9")
  const [size, setSize] = useState<number>(10)
  const [strokes, setStrokes] = useState<THREE.Group[]>([])
  const [movementLocked, setMovementLocked] = useState<boolean>(false)
  const opacityRef = useRef<number>(1)
  const hardnessRef = useRef<number>(0.6)
  const particleRateRef = useRef<number>(0)
  const toolRef = useRef<Tool>("brush")
  const colorRef = useRef<string>("#c147e9")
  const sizeRef = useRef<number>(10)
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null)

  useEffect(() => {
    const setVoice = () => {
      const voices = window.speechSynthesis.getVoices()
      const lower = (s: string) => s.toLowerCase()
      const candidates = voices.filter((v) => v.lang && lower(v.lang).startsWith("es"))
      const preferLang = ["es-mx", "es_419", "es-419", "es-es", "es-co", "es"]
      const preferName = ["sabina", "mexico", "latam", "español", "spanish"]
      let chosen: SpeechSynthesisVoice | null = null
      for (const p of preferLang) {
        const m = candidates.find((v) => lower(v.lang).startsWith(p))
        if (m) { chosen = m; break }
      }
      if (!chosen) {
        const m = candidates.find((v) => v.name && preferName.some((n) => lower(v.name).includes(n)))
        if (m) chosen = m
      }
      voiceRef.current = chosen || candidates[0] || null
    }
    setVoice()
    window.speechSynthesis.onvoiceschanged = setVoice
  }, [])

  const speak = (text: string) => {
    if (!("speechSynthesis" in window)) return
    const v = voiceRef.current
    const isSpanish = !!v && v.lang?.toLowerCase().startsWith("es")
    if (!isSpanish) {
      try {
        const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext
        const ctx = Ctx ? new Ctx() : null
        if (ctx) {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = "sine"
          osc.frequency.value = 880
          gain.gain.setValueAtTime(0.001, ctx.currentTime)
          gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.02)
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start()
          osc.stop(ctx.currentTime + 0.2)
          setTimeout(() => ctx.close(), 250)
        }
      } catch (e) { void e }
      return
    }
    const utter = new SpeechSynthesisUtterance(text)
    if (v) utter.voice = v
    utter.lang = "es-MX"
    utter.rate = 0.98
    utter.pitch = 1.1
    utter.volume = 1
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utter)
  }

  const colorName = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const l = (max + min) / 2
    const d = max - min
    let h = 0
    const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1))
    if (d !== 0) {
      if (max === r) h = ((g - b) / d) % 6
      else if (max === g) h = (b - r) / d + 2
      else h = (r - g) / d + 4
      h *= 60
      if (h < 0) h += 360
    }
    if (l <= 0.15) return "negro"
    if (l >= 0.85) return "blanco"
    if (s <= 0.2) return "gris"
    if (h < 15) return "rojo"
    if (h < 35) return "naranja"
    if (h < 60) return "amarillo"
    if (h < 150) return "verde"
    if (h < 190) return "turquesa"
    if (h < 210) return "cian"
    if (h < 240) return "azul"
    if (h < 260) return "índigo"
    if (h < 290) return "violeta"
    if (h < 320) return "magenta"
    if (h < 345) return "rosa"
    return "rojo"
  }

  useEffect(() => {
    if (!stageRef.current) return

    const stage = stageRef.current
    const w = stage.clientWidth
    const h = Math.max(320, stage.clientHeight)

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(w, h)
    rendererRef.current = renderer
    stage.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color("#0b1a2b")
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 100)
    camera.position.set(8, 6, 10)
    cameraRef.current = camera

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controlsRef.current = controls

    scene.add(new THREE.AmbientLight(0xffffff, 0.7))
    const dir = new THREE.DirectionalLight(0xffffff, 0.9)
    dir.position.set(5, 8, 5)
    scene.add(dir)

    const planeGeo = new THREE.PlaneGeometry(20, 12)
    const planeMat = new THREE.MeshStandardMaterial({ color: 0x6b7280, roughness: 0.9, metalness: 0.0 })
    const plane = new THREE.Mesh(planeGeo, planeMat)
    plane.rotation.x = -Math.PI / 6
    plane.position.y = 0
    planeRef.current = plane
    scene.add(plane)

    let raf = 0
    const renderLoop = () => {
      controls.update()
      renderer.render(scene, camera)
      raf = requestAnimationFrame(renderLoop)
    }
    renderLoop()

    const onResize = () => {
      if (!rendererRef.current || !cameraRef.current || !stageRef.current) return
      const ww = stageRef.current.clientWidth
      const hh = Math.max(320, stageRef.current.clientHeight)
      rendererRef.current.setSize(ww, hh)
      cameraRef.current.aspect = ww / hh
      cameraRef.current.updateProjectionMatrix()
    }
    const onPointerDown = (e: PointerEvent) => {
      const p = intersectOnPlane(e)
      if (!p) return
      drawingRef.current = true
      const group = new THREE.Group()
      currentStrokeRef.current = group
      lastPointRef.current = p.clone()
      scene.add(group)
      setStrokes((prev) => [...prev, group])
      paintAtPoint(p, group)
    }
    const onPointerMove = (e: PointerEvent) => {
      if (!drawingRef.current) return
      const p = intersectOnPlane(e)
      if (!p || !currentStrokeRef.current) return
      paintAtPoint(p, currentStrokeRef.current)
    }
    const onPointerUp = () => {
      drawingRef.current = false
      currentStrokeRef.current = null
      lastPointRef.current = null
    }

    window.addEventListener("resize", onResize)
    renderer.domElement.addEventListener("pointerdown", onPointerDown)
    renderer.domElement.addEventListener("pointermove", onPointerMove)
    window.addEventListener("pointerup", onPointerUp)

    return () => {
      window.removeEventListener("resize", onResize)
      renderer.domElement.removeEventListener("pointerdown", onPointerDown)
      renderer.domElement.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("pointerup", onPointerUp)
      cancelAnimationFrame(raf)
      controls.dispose()
      renderer.dispose()
      stage.removeChild(renderer.domElement)
    }
  }, [])

  useEffect(() => {
    const applyPreset = (t: Tool) => {
      if (t === "pencil") { setSize(1); opacityRef.current = 1; hardnessRef.current = 0.9; particleRateRef.current = 0; return }
      if (t === "watercolor") { setSize(4); opacityRef.current = 0.45; hardnessRef.current = 0.4; particleRateRef.current = 0; return }
      if (t === "brush") { setSize(12); opacityRef.current = 0.95; hardnessRef.current = 0.6; particleRateRef.current = 0; return }
      if (t === "textured") { setSize(8); opacityRef.current = 0.8; hardnessRef.current = 0.7; particleRateRef.current = 0; return }
      if (t === "spray") { setSize(15); opacityRef.current = 0.4; hardnessRef.current = 0.3; particleRateRef.current = 300; return }
      if (t === "glow") { setSize(10); opacityRef.current = 0.6; hardnessRef.current = 0.6; particleRateRef.current = 120; return }
      if (t === "eraser") { setSize(12); opacityRef.current = 1; hardnessRef.current = 0.6; particleRateRef.current = 0; return }
      if (t === "marker") { setSize(12); opacityRef.current = 0.65; hardnessRef.current = 0.7; particleRateRef.current = 0; return }
    }
    applyPreset(tool)
    toolRef.current = tool
  }, [tool])

  useEffect(() => { colorRef.current = color }, [color])
  useEffect(() => { sizeRef.current = size }, [size])

  useEffect(() => {
    if (controlsRef.current) controlsRef.current.enabled = !movementLocked
  }, [movementLocked])

  const intersectOnPlane = (e: PointerEvent) => {
    if (!rendererRef.current || !cameraRef.current || !planeRef.current) return null
    const rect = rendererRef.current.domElement.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1
    raycasterRef.current.setFromCamera(new THREE.Vector2(x, y), cameraRef.current)
    const hit = raycasterRef.current.intersectObject(planeRef.current, false)
    return hit.length ? hit[0].point : null
  }

  const paintAtPoint = (p: THREE.Vector3, group: THREE.Group) => {
    const baseColor = new THREE.Color(colorRef.current)
    const unit = Math.max(0.02, sizeRef.current * 0.02)
    const jitter = (r: number) => (Math.random() * 2 - 1) * r
    const t = toolRef.current

    if (t === "spray") {
      const count = Math.max(100, Math.round(Math.max(300, particleRateRef.current)))
      const positions = new Float32Array(count * 3)
      for (let i = 0; i < count; i++) {
        const ix = i * 3
        positions[ix] = p.x + jitter(unit)
        positions[ix + 1] = p.y + jitter(unit)
        positions[ix + 2] = p.z + jitter(unit)
      }
      const geo = new THREE.BufferGeometry()
      geo.setAttribute("position", new THREE.BufferAttribute(positions, 3))
      const mat = new THREE.PointsMaterial({ color: baseColor, size: unit * 0.8, transparent: true, opacity: opacityRef.current })
      const pts = new THREE.Points(geo, mat)
      group.add(pts)
      return
    }

    if (t === "watercolor") {
      for (let i = 0; i < 6; i++) {
        const geo = new THREE.CircleGeometry(unit * (1.0 + Math.random()*0.8), 24)
        const mat = new THREE.MeshBasicMaterial({ color: baseColor, transparent: true, opacity: opacityRef.current })
        const m = new THREE.Mesh(geo, mat)
        m.position.set(p.x + jitter(unit*0.6), p.y + jitter(unit*0.6), p.z + jitter(unit*0.6))
        if (planeRef.current) m.quaternion.copy(planeRef.current.quaternion)
        group.add(m)
      }
      return
    }

    if (t === "glow") {
      const spriteMat = new THREE.SpriteMaterial({ color: baseColor, transparent: true, opacity: opacityRef.current, blending: THREE.AdditiveBlending })
      const n = Math.max(1, Math.round(particleRateRef.current * 0.05))
      for (let i = 0; i < n; i++) {
        const spr = new THREE.Sprite(spriteMat)
        spr.scale.set(unit * (6 + Math.random()*6), unit * (6 + Math.random()*6), 1)
        spr.position.set(p.x + jitter(unit), p.y + jitter(unit), p.z + jitter(unit))
        group.add(spr)
      }
      return
    }

    if (t === "eraser") {
      const planeColor = (planeRef.current?.material as THREE.MeshStandardMaterial).color
      const geo = new THREE.SphereGeometry(unit, 16, 16)
      const mat = new THREE.MeshStandardMaterial({ color: planeColor.clone(), transparent: true, opacity: 1 })
      const m = new THREE.Mesh(geo, mat)
      m.position.copy(p)
      group.add(m)
      return
    }
    if (t === "marker") {
      const geo = new THREE.CircleGeometry(unit * 1.2, 16)
      const mat = new THREE.MeshBasicMaterial({ color: baseColor, transparent: true, opacity: opacityRef.current, side: THREE.DoubleSide })
      const m = new THREE.Mesh(geo, mat)
      m.position.copy(p)
      if (planeRef.current) m.quaternion.copy(planeRef.current.quaternion)
      group.add(m)
      return
    }

    if (t === "pencil") {
      const a = lastPointRef.current || p.clone()
      const b = p.clone()
      const curve = new THREE.CatmullRomCurve3([a, b])
      const geo = new THREE.TubeGeometry(curve, 1, unit * 0.25, 8, false)
      const mat = new THREE.MeshBasicMaterial({ color: baseColor })
      const m = new THREE.Mesh(geo, mat)
      group.add(m)
      lastPointRef.current = b.clone()
      return
    }

    if (t === "brush") {
      const a = lastPointRef.current || p.clone()
      const b = p.clone()
      const curve = new THREE.CatmullRomCurve3([a, b])
      const geo = new THREE.TubeGeometry(curve, 2, unit * 0.9, 12, false)
      const mat = new THREE.MeshStandardMaterial({ color: baseColor, roughness: 0.8, metalness: 0.0 })
      const m = new THREE.Mesh(geo, mat)
      group.add(m)
      lastPointRef.current = b.clone()
      return
    }

    if (t === "textured") {
      for (let i = 0; i < 3; i++) {
        const r = unit * (0.6 + Math.random()*0.8)
        const mat = new THREE.MeshStandardMaterial({ color: baseColor.clone().offsetHSL(0, 0, (Math.random()-0.5)*0.1), roughness: 0.9, metalness: 0.0, transparent: true, opacity: opacityRef.current })
        const geo = new THREE.BoxGeometry(r*0.7, r*0.7, r*0.7)
        const m = new THREE.Mesh(geo, mat)
        m.position.set(p.x + jitter(unit*0.4), p.y + jitter(unit*0.4), p.z + jitter(unit*0.4))
        group.add(m)
      }
      lastPointRef.current = p.clone()
      return
    }

    const geo = new THREE.SphereGeometry(unit, 16, 16)
    const mat = new THREE.MeshStandardMaterial({ color: baseColor, opacity: 0.95 })
    const m = new THREE.Mesh(geo, mat)
    m.position.copy(p)
    group.add(m)
  }

  const undo = () => {
    const last = strokes[strokes.length - 1]
    if (!last || !sceneRef.current) return
    sceneRef.current.remove(last)
    setStrokes((prev) => prev.slice(0, -1))
  }

  const clearAll = () => {
    if (!sceneRef.current) return
    strokes.forEach((g) => sceneRef.current!.remove(g))
    setStrokes([])
  }

  const saveImage = () => {
    if (!rendererRef.current) return
    const url = rendererRef.current.domElement.toDataURL("image/png")
    const a = document.createElement("a")
    a.href = url
    a.download = "pintura3d.png"
    a.click()
  }

  const palette = [
    "#c147e9", "#a855f7", "#6b46a3", "#4a2c6d", "#2d1b4e", "#7c3aed",
    "#ec4899", "#f472b6", "#db2777",
    "#ef4444", "#dc2626", "#ff3b30",
    "#f97316", "#ea580c", "#ff9500",
    "#f59e0b", "#ffdd00", "#fde047",
    "#10b981", "#22c55e", "#84cc16",
    "#14b8a6", "#2dd4bf",
    "#00c2ff", "#7df9ff", "#4a90e2", "#60a5fa", "#3b82f6", "#2563eb", "#1d4ed8",
    "#6366f1", "#4f46e5",
    "#8b5e3c", "#b45309",
    "#ffffff", "#d1d5db", "#9ca3af", "#374151", "#000000"
  ]

  return (
    <div className="relative space-y-6">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="w-full h-full rounded-3xl overflow-hidden ring-1 ring-[#7df9ff]/15 bg-gradient-to-b from-[#0e3a66]/55 via-[#1e40af]/50 to-[#0e3a66]/55" />
      </div>
      <div className="relative z-10 text-center space-y-4">
        <h1 className="text-7xl md:text-8xl font-extrabold bg-gradient-to-r from-[#ff00cc] via-[#00f0ff] to-[#ffe600] bg-clip-text text-transparent drop-shadow-[0_0_28px_rgba(0,240,255,0.6)]">
          PintaColor3D
        </h1>
        <div className="max-w-3xl mx-auto">
          <div className="text-lg md:text-2xl font-semibold text-center bg-gradient-to-r from-[#ff00cc] via-[#00f0ff] to-[#ffe600] bg-clip-text text-transparent">
            🎨 ¡Bienvenido! Pinta en 3D, mezcla colores mágicos y gira tu obra
          </div>
        </div>
      </div>
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
        <Card className="p-0 bg-gradient-to-br from-[#2d1b4e]/95 via-[#4a2c6d]/95 to-[#6b46a3]/95 border-[#c147e9] border-2">
          <CardContent className="p-4 space-y-4">
            <div className="text-[#e7d7ff] text-sm">Herramientas</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Detalle fino", key: "pencil", grad: "from-yellow-400 to-orange-500", Icon: FaPencilAlt },
                { label: "Suave", key: "watercolor", grad: "from-pink-500 to-fuchsia-600", Icon: FaTint },
                { label: "Base", key: "brush", grad: "from-purple-500 to-violet-600", Icon: FaPaintBrush },
                { label: "Texturizado", key: "textured", grad: "from-rose-500 to-red-600", Icon: FaChessBoard },
                { label: "Spray", key: "spray", grad: "from-cyan-400 to-sky-500", Icon: FaSprayCan },
                { label: "Efecto", key: "glow", grad: "from-indigo-500 to-blue-600", Icon: FaMagic },
                { label: "Marcador", key: "marker", grad: "from-green-400 to-emerald-600", Icon: FaHighlighter },
                { label: "Goma", key: "eraser", grad: "from-lime-400 to-green-600", Icon: FaEraser },
              ].map(({ label, key, grad, Icon }) => (
                <Button
                  key={key}
                  onClick={() => { setTool(key as Tool); speak(`Elegiste ${label}`) }}
                  className={`rounded-full px-4 py-2 bg-gradient-to-r ${grad} text-white shadow hover:opacity-95 gap-2 focus:ring-2 focus:ring-[#7df9ff] focus:shadow-[0_0_18px_rgba(125,249,255,0.65)] active:shadow-[0_0_24px_rgba(125,249,255,0.85)] ${tool===key?"ring-2 ring-[#7df9ff] shadow-[0_0_18px_rgba(125,249,255,0.65)]":"opacity-90"}`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Button>
              ))}
            </div>
            <div className="text-[#e7d7ff] text-sm pt-4">Colores</div>
            <div className="grid grid-cols-8 gap-2">
              {palette.map((c) => (
                <button
                  key={c}
                  onClick={() => { setColor(c); speak(`Color ${colorName(c)}`) }}
                  className={`w-8 h-8 rounded-lg border-2 border-[#c147e9]/50 focus:ring-2 focus:ring-[#7df9ff] focus:shadow-[0_0_18px_rgba(125,249,255,0.65)] active:shadow-[0_0_24px_rgba(125,249,255,0.85)] ${color===c?"ring-2 ring-[#7df9ff] shadow-[0_0_18px_rgba(125,249,255,0.65)]":""}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <div className="pt-4">
              <div className="text-[#e7d7ff] text-sm pb-1">Grosor</div>
              <input type="range" min={1} max={25} value={size} onChange={(e)=>setSize(parseInt(e.target.value))} className="w-full" />
              <div className="text-[#e7d7ff] text-sm mt-1">{size}px</div>
            </div>
            <div className="pt-2">
              <Button
                onClick={() => { const v = !movementLocked; setMovementLocked(v); speak(v?"Movimiento bloqueado":"Movimiento desbloqueado") }}
                className={`rounded-full px-4 py-2 bg-gradient-to-r text-white shadow hover:opacity-95 gap-2 focus:ring-2 focus:ring-[#7df9ff] focus:shadow-[0_0_18px_rgba(125,249,255,0.65)] active:shadow-[0_0_24px_rgba(125,249,255,0.85)] ${movementLocked?"from-red-500 to-rose-600":"from-sky-500 to-blue-600"}`}
              >
                {movementLocked ? <FaLockOpen className="w-4 h-4" /> : <FaLock className="w-4 h-4" />}
                {movementLocked ? "Desbloquear movimiento" : "Bloquear movimiento"}
              </Button>
            </div>
            <div className="flex flex-col gap-2 pt-4">
              <Button onClick={() => { undo(); speak("Deshacer") }} className="rounded-full px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow hover:opacity-95 gap-2 focus:ring-2 focus:ring-[#7df9ff] focus:shadow-[0_0_18px_rgba(125,249,255,0.65)] active:shadow-[0_0_24px_rgba(125,249,255,0.85)]">
                <FaUndo className="w-4 h-4" />
                Deshacer
              </Button>
              <Button onClick={() => { clearAll(); speak("Lienzo limpio") }} className="rounded-full px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white shadow hover:opacity-95 gap-2 focus:ring-2 focus:ring-[#7df9ff] focus:shadow-[0_0_18px_rgba(125,249,255,0.65)] active:shadow-[0_0_24px_rgba(125,249,255,0.85)]">
                <FaTrashAlt className="w-4 h-4" />
                Limpiar
              </Button>
              <Button onClick={() => { saveImage(); speak("Imagen guardada") }} className="rounded-full px-4 py-2 bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow hover:opacity-95 gap-2 focus:ring-2 focus:ring-[#7df9ff] focus:shadow-[0_0_18px_rgba(125,249,255,0.65)] active:shadow-[0_0_24px_rgba(125,249,255,0.85)]">
                <FaSave className="w-4 h-4" />
                Guardar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="p-0 bg-gradient-to-br from-[#2d1b4e]/95 via-[#4a2c6d]/95 to-[#6b46a3]/95 border-[#c147e9] border-2">
          <CardContent className="p-4">
            <div ref={stageRef} className="w-full h-[520px] rounded-xl overflow-hidden bg-[#0b1a2b] border-2 border-[#c147e9]/50 shadow-[0_0_40px_rgba(193,71,233,0.35)]" />
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="rounded-xl bg-[#2d1b4e]/70 p-4 text-[#e7d7ff]">Trazos
                <div className="text-2xl font-bold text-[#7df9ff]">{strokes.length}</div>
              </div>
              <div className="rounded-xl bg-[#2d1b4e]/70 p-4 text-[#e7d7ff]">Herramienta
                <div className="text-lg font-semibold text-white">{toolLabels[tool]}</div>
              </div>
              <div className="rounded-xl bg-[#2d1b4e]/70 p-4 text-[#e7d7ff]">Color
                <div className="mt-2 w-8 h-8 rounded-lg border-2 border-[#c147e9]/50" style={{ backgroundColor: color }} />
              </div>
            </div>
            <div className="mt-6 space-y-4">
              <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-[#7df9ff] via-[#c147e9] to-[#ffdd00] bg-clip-text text-transparent">
                  PintaColor3D: ¡Así de fácil!
                </h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-[#0ea5e9]/40 to-[#7df9ff]/40 border border-[#7df9ff]/30 text-white">
                  <FaPaintBrush className="w-6 h-6" />
                  <span className="font-semibold">Elige tu herramienta favorita</span>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-[#22c55e]/40 to-[#84cc16]/40 border border-[#84cc16]/30 text-white">
                  <FaTint className="w-6 h-6" />
                  <span className="font-semibold">Mezcla y elige un color brillante</span>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-[#f59e0b]/40 to-[#ffdd00]/40 border border-[#ffdd00]/30 text-white">
                  <FaLock className="w-6 h-6" />
                  <span className="font-semibold">Bloquea el movimiento si quieres pintar fijo</span>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-[#8b5cf6]/40 to-[#6366f1]/40 border border-[#6366f1]/30 text-white">
                  <FaSprayCan className="w-6 h-6" />
                  <span className="font-semibold">Arrastra sobre el tablero para dibujar</span>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-[#ef4444]/40 to-[#dc2626]/40 border border-[#ef4444]/30 text-white">
                  <FaUndo className="w-6 h-6" />
                  <span className="font-semibold">Si te equivocas, usa Deshacer</span>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-[#c147e9]/40 to-[#a855f7]/40 border border-[#c147e9]/30 text-white">
                  <FaSave className="w-6 h-6" />
                  <span className="font-semibold">Guarda tu obra cuando te guste</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}