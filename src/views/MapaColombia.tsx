import { useEffect, useMemo, useRef, useState } from "react";
import { departamentos, actividadesPorRegion, type Departamento } from "../data/colombiaDepartamentos";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Trophy, Star } from "lucide-react";
import { DRAG_THRESHOLD, panFactor } from "./panUtils";

// Vista fusionada: Mapa SVG interactivo + panel de información
// Al hacer clic en un departamento (en el SVG), se muestra su información.
export default function MapaColombia() {
  const [busqueda, setBusqueda] = useState("");
  const [regionFiltro, setRegionFiltro] = useState<string>("Todas");
  const [seleccion, setSeleccion] = useState<Departamento | null>(null);
  const [svgDisponible, setSvgDisponible] = useState<boolean>(true);
  const svgContainerRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const zoomWrapperRef = useRef<HTMLDivElement | null>(null);
  const [svgLoaded, setSvgLoaded] = useState<boolean>(false);
  // Zoom y referencias a elementos SVG
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  // Bandera global para saber si estamos arrastrando (evita transiciones)
  const isDraggingRef = useRef(false);
  // Restablecer vista (mejorado)
  const resetView = () => {
    try {
      const synth = (window as any).speechSynthesis as SpeechSynthesis | undefined;
      synth?.cancel();
    } catch (err) {
      console.warn('resetView: speechSynthesis cancel failed', err);
    }
    setZoom(1);
    setPan({ x: 0, y: 0 });
    const wrapper = zoomWrapperRef.current;
    if (wrapper) {
      (wrapper.style as any).transition = 'transform 200ms ease-in-out';
    }
  };
  const inlineSvgElRef = useRef<SVGElement | null>(null);
  const objectElRef = useRef<HTMLObjectElement | null>(null);
  // Gamificación: puntos y departamentos visitados
  const [puntos, setPuntos] = useState<number>(0);
  const [visitados, setVisitados] = useState<string[]>([]);
  // TTS: reproducir información del departamento seleccionado (incluye datos curiosos)
  const speakDepartamento = (dep: Departamento) => {
    try {
      const synth = (window as any).speechSynthesis as SpeechSynthesis | undefined;
      if (!synth) return;
      const acts = actividadesPorRegion[dep.region] || [];
      const curios = curiosidadesPorRegion[dep.region] || [];
      const curiosBreves = curios.slice(0, 3).join('; ');
      const texto = `${dep.nombre}. Capital: ${dep.capital}. Región: ${dep.region}. ` +
        (typeof dep.poblacionAprox === 'number' ? `Población aproximada: ${dep.poblacionAprox.toLocaleString('es-CO')}. ` : '') +
        (acts.length ? `Actividades sugeridas: ${acts.join('; ')}. ` : '') +
        (curios.length ? `Datos curiosos: ${curiosBreves}.` : '');
      const u = new SpeechSynthesisUtterance(texto);
      u.lang = 'es-CO'; u.rate = 1; u.pitch = 1; u.volume = 1;
      synth.cancel();
      synth.speak(u);
    } catch (error) {
      console.error('speakDepartamento error', error);
    }
  };

  useEffect(() => {
    const last = localStorage.getItem("mapaColombia:seleccion");
    if (last) {
      try {
        const parsed = JSON.parse(last) as Departamento;
        setSeleccion(parsed);
      } catch (error) {
        console.error('Error al parsear selección previa', error);
      }
    }
  }, []);

  useEffect(() => {
    if (seleccion) localStorage.setItem("mapaColombia:seleccion", JSON.stringify(seleccion));
  }, [seleccion]);

  // Al seleccionar un departamento nuevo, sumar puntos y marcar como visitado
  useEffect(() => {
    if (!seleccion) return;
    setVisitados((prev) => {
      if (prev.includes(seleccion.id)) return prev;
      const next = [...prev, seleccion.id];
      setPuntos((p) => p + 10);
      return next;
    });
  }, [seleccion]);

  const regiones = useMemo(() => ["Todas", "Caribe", "Pacífica", "Andina", "Orinoquía", "Amazonía", "Insular"], []);

  const listaFiltrada = useMemo(() => {
    return departamentos.filter((d) => {
      const okRegion = regionFiltro === "Todas" || d.region === regionFiltro;
      const okTexto = busqueda.trim().length === 0 || d.nombre.toLowerCase().includes(busqueda.toLowerCase());
      return okRegion && okTexto;
    });
  }, [busqueda, regionFiltro]);

  const actividades = seleccion ? actividadesPorRegion[seleccion.region] : [];
  // Curiosidades por región (breves y amigables para niños)
  const curiosidadesPorRegion: Record<Departamento["region"], string[]> = {
    Caribe: [
      "Aquí nació el vallenato 🎶",
      "Playas cálidas y brisa fuerte 🏖️",
      "Carnaval de Barranquilla muy famoso 🎭",
    ],
    Pacífica: [
      "Selvas húmedas y mucha lluvia 🌧️",
      "Ballenas visitan en temporada 🐋",
      "Tamboras y marimba suenan aquí 🥁",
    ],
    Andina: [
      "Cordilleras y montañas altas ⛰️",
      "Climas fríos y templados 🧥",
      "Muchas ciudades grandes 🏙️",
    ],
    Orinoquía: [
      "Llanos extensos y atardeceres hermosos 🌅",
      "Tradición ganadera y caballos 🐎",
      "Joropo: música y baile típico 🎵",
    ],
    Amazonía: [
      "Bosque tropical más grande 🌳",
      "Gran diversidad de animales 🦜",
      "Ríos caudalosos y comunidades indígenas 🛶",
    ],
    Insular: [
      "Islas con mar turquesa 🏝️",
      "Arrecifes y corales coloridos 🪸",
      "Idioma creole junto al español 🗣️",
    ],
  };

  // Estado y funciones para un modo Quiz sencillo
  type Pregunta = {
    tipo: "capital" | "region";
    departamento: Departamento;
    opciones: string[];
    respuestaCorrecta: string;
  };
  const [quizActivo, setQuizActivo] = useState(false);
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [indicePregunta, setIndicePregunta] = useState(0);
  const [puntaje, setPuntaje] = useState(0);
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState<string | null>(null);
  const [quizFinalizado, setQuizFinalizado] = useState(false);

  function generarPreguntas(cantidad = 6) {
    const mezcla = [...departamentos].sort(() => Math.random() - 0.5).slice(0, cantidad);
    const preguntasGeneradas: Pregunta[] = mezcla.map((dep, idx) => {
      const tipo: Pregunta["tipo"] = idx % 2 === 0 ? "capital" : "region";
      if (tipo === "capital") {
        const distractores = [...departamentos]
          .filter((d) => d.id !== dep.id)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map((d) => d.capital);
        const opciones = [...distractores, dep.capital].sort(() => Math.random() - 0.5);
        return { tipo, departamento: dep, opciones, respuestaCorrecta: dep.capital };
      } else {
        const regionesPosibles: Departamento["region"][] = [
          "Caribe",
          "Pacífica",
          "Andina",
          "Orinoquía",
          "Amazonía",
          "Insular",
        ];
        const distractores = regionesPosibles.filter((r) => r !== dep.region).sort(() => Math.random() - 0.5).slice(0, 3);
        const opciones = [...distractores, dep.region].sort(() => Math.random() - 0.5);
        return { tipo, departamento: dep, opciones, respuestaCorrecta: dep.region };
      }
    });
    setPreguntas(preguntasGeneradas);
    setIndicePregunta(0);
    setPuntaje(0);
    setRespuestaSeleccionada(null);
    setQuizFinalizado(false);
  }
  function iniciarQuiz() { generarPreguntas(6); setQuizActivo(true); }
  function responder(opcion: string) {
    if (quizFinalizado) return;
    setRespuestaSeleccionada(opcion);
    const actual = preguntas[indicePregunta];
    if (opcion === actual.respuestaCorrecta) setPuntaje((p) => p + 1);
  }
  function siguientePregunta() {
    if (indicePregunta + 1 < preguntas.length) {
      setIndicePregunta((i) => i + 1);
      setRespuestaSeleccionada(null);
    } else {
      setQuizFinalizado(true);
    }
  }

  // Búsqueda: si el texto coincide con un departamento, mostrar su información
  useEffect(() => {
    const q = busqueda.trim();
    if (!q) return;
    const normalizeTxt = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    const nq = normalizeTxt(q);
    const dep = departamentos.find((d) => {
      const byName = normalizeTxt(d.nombre) === nq;
      const byId = normalizeTxt(d.id) === nq;
      return byName || byId;
    });
    if (dep) setSeleccion(dep);
  }, [busqueda]);

  // Cargar el SVG como HTML y volverlo interactivo
  useEffect(() => {
    const fetchSvg = async () => {
      try {
        // Unificar a una sola ruta estable
        const res = await fetch("/Colombia.svg");
        if (!res.ok) throw new Error("SVG not found");
        const text = await res.text();
        const container = svgContainerRef.current;
        const wrapper = zoomWrapperRef.current;
        if (!container || !wrapper) return;
        wrapper.innerHTML = text;
        // Forzar que el SVG ocupe el ancho disponible
        const insertedSvg = wrapper.querySelector('svg') as SVGElement | null;
        if (insertedSvg) {
          insertedSvg.setAttribute('width', '100%');
          insertedSvg.setAttribute('height', '100%');
          insertedSvg.style.display = 'block';
          insertedSvg.style.margin = '0';
          insertedSvg.style.maxWidth = 'none';
          inlineSvgElRef.current = insertedSvg;
          // Inyectar estilos para las clases de resaltado en modo inline
          const style = document.createElement('style');
          style.textContent = `.dept-hover { filter: brightness(1.06) drop-shadow(0 1px 0 rgba(0,0,0,0.2)); transition: filter 0.2s ease; }
          .dept-selected { stroke: #10b981 !important; stroke-width: 4 !important; vector-effect: non-scaling-stroke; filter: drop-shadow(0 2px 0 rgba(0,0,0,0.4)) drop-shadow(0 10px 10px rgba(0,0,0,0.28)); transform: translateY(-1px) scale(1.012); transition: filter 0.2s ease, transform 0.2s ease; }
          .label-selected { fill: #10b981; font-weight: 700; }`;
          insertedSvg.appendChild(style);
        }
        // Si no se insertó correctamente o tiene tamaño 0, usar fallback con <object>
        const shouldFallback = !insertedSvg || ((insertedSvg.clientWidth === 0) && (insertedSvg.clientHeight === 0));
        if (shouldFallback) {
          const obj: HTMLObjectElement = document.createElement('object');
          obj.type = 'image/svg+xml';
          obj.data = '/Colombia.svg';
          obj.style.width = '100%';
          obj.style.height = '100%';
          obj.style.maxWidth = 'none';
          obj.style.display = 'block';
          objectElRef.current = obj;
          obj.onerror = () => {
            // Si falla la carga del objeto, marcamos como no disponible
            setSvgDisponible(false);
            setSvgLoaded(false);
          };
          obj.onload = () => {
            try {
              const doc = obj.contentDocument;
              if (doc) {
                const svg = doc.querySelector('svg');
                if (svg) {
                const style = doc.createElement('style');
                style.textContent = `.dept-hover { filter: brightness(1.06) drop-shadow(0 1px 0 rgba(0,0,0,0.2)); transition: filter 0.2s ease; }
                .dept-selected { stroke: #10b981 !important; stroke-width: 3 !important; vector-effect: non-scaling-stroke; filter: drop-shadow(0 2px 0 rgba(0,0,0,0.35)) drop-shadow(0 8px 8px rgba(0,0,0,0.25)); transform: translateY(-1px); transition: filter 0.2s ease, transform 0.2s ease; }
                .label-selected { fill: #10b981; font-weight: 700; }`;
                svg.appendChild(style);
              }

                // Normalización y búsqueda
                const normalize = (s: string) =>
                  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[_\s]+/g, '_').trim();
                const findDepartamento = (raw: string) => {
                  const norm = normalize(raw);
                  let dep = departamentos.find((d) => normalize(d.id) === norm);
                  if (dep) return dep;
                  dep = departamentos.find((d) => normalize(d.nombre) === norm);
                  if (dep) return dep;
                  const alias: Record<string, string> = {
                    narino: 'narinio',
                    cesar: 'cesar',
                    valle_del_cauca: 'valle',
                    norte_de_santander: 'norte_santander',
                    san_andres_y_providencia: 'san_andres',
                  };
                  const mapped = alias[norm];
                  if (mapped) return departamentos.find((d) => d.id === mapped) || null;
                  return null;
                };

                // Nota: el resaltado de etiqueta se realiza directamente en el listener de clic de cada <text>,
                // por lo que no se requiere un helper separado aquí.

                // Enlazar a nodos con data-dept o id
                const nodes = doc.querySelectorAll<SVGElement>('[data-dept], [id]');
                nodes.forEach((el) => {
                  el.style.cursor = 'default';
                });

                // Hacer clic en etiquetas <text>
                const textEls = Array.from(doc.querySelectorAll<SVGTextElement>('text'));
                textEls.forEach((t) => {
                  const label = (t.textContent || '').trim();
                  const next = t.nextElementSibling as SVGTextElement | null;
                  const prev = t.previousElementSibling as SVGTextElement | null;
                  const combinedNext = next && next.tagName.toLowerCase() === 'text' ? `${label} ${(next.textContent || '').trim()}` : null;
                  const combinedPrev = prev && prev.tagName.toLowerCase() === 'text' ? `${(prev.textContent || '').trim()} ${label}` : null;
                  const dep = (combinedNext && findDepartamento(combinedNext)) || (combinedPrev && findDepartamento(combinedPrev)) || findDepartamento(label);
                  if (dep) {
                    t.style.cursor = 'pointer';
                    t.addEventListener('click', () => {
                      setSeleccion(dep);
                      nodes.forEach((n) => n.classList.remove('dept-selected'));
                      textEls.forEach((tt) => tt.classList.remove('label-selected'));
                      t.classList.add('label-selected');
                    });
                  }
                });

                // Auto-etiquetar shapes cercanos a etiquetas
                const assigned = new Set<SVGElement>();
                const shapeEls = Array.from(doc.querySelectorAll<SVGGraphicsElement>('path, polygon, polyline'));
                const centerDist = (a: DOMRect, b: DOMRect) => {
                  const ax = a.x + a.width / 2;
                  const ay = a.y + a.height / 2;
                  const bx = b.x + b.width / 2;
                  const by = b.y + b.height / 2;
                  const dx = ax - bx;
                  const dy = ay - by;
                  return Math.sqrt(dx * dx + dy * dy);
                };
                textEls.forEach((t) => {
                  const label = (t.textContent || '').trim();
                  const next = t.nextElementSibling as SVGTextElement | null;
                  const prev = t.previousElementSibling as SVGTextElement | null;
                  const combinedNext = next && next.tagName.toLowerCase() === 'text' ? `${label} ${(next?.textContent || '').trim()}` : null;
                  const combinedPrev = prev && prev.tagName.toLowerCase() === 'text' ? `${(prev?.textContent || '').trim()} ${label}` : null;
                  const dep = (combinedNext && findDepartamento(combinedNext)) || (combinedPrev && findDepartamento(combinedPrev)) || findDepartamento(label);
                  if (!dep) return;
                  let bestEl: SVGGraphicsElement | null = null;
                  let bestD = Infinity;
                  let tBox: DOMRect | null = null;
                  try { tBox = t.getBBox(); } catch { tBox = null; }
                  if (!tBox) return;
                  shapeEls.forEach((sh) => {
                    if (assigned.has(sh)) return;
                    try {
                      const b = sh.getBBox();
                      const d = centerDist(tBox!, b);
                      if (d < bestD) { bestD = d; bestEl = sh; }
                    } catch (error) {
                      console.error('shapeEls getBBox error', error);
                    }
                  });
                  if (bestEl && bestD < 120) {
                    const el = bestEl as SVGGraphicsElement;
                    assigned.add(el);
                    el.setAttribute('data-dept', dep.id);
                    el.style.cursor = 'default';
                  }
                });
              }
            } catch (error) {
              console.error('object onload wiring error', error);
            }
            setSvgDisponible(true);
            setSvgLoaded(true);
          };
          const wrapper = zoomWrapperRef.current;
          if (wrapper) {
            wrapper.innerHTML = '';
            wrapper.appendChild(obj);
          }
          // Evitar seguir con wiring del SVG inline si usamos <object>
          return;
        }
        setSvgLoaded(true);
        setSvgDisponible(true);

        // Helpers de normalización y selección
        const normalize = (s: string) =>
          s
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[_\s]+/g, "_")
            .trim();

        const findDepartamento = (raw: string) => {
          const norm = normalize(raw);
          // Intento directo por id
          let dep = departamentos.find((d) => normalize(d.id) === norm);
          if (dep) return dep;
          // Intento por nombre
          dep = departamentos.find((d) => normalize(d.nombre) === norm);
          if (dep) return dep;
          // Mapeo de alias frecuentes
          const alias: Record<string, string> = {
            narino: "narinio",
            cesar: "cesar",
            valle_del_cauca: "valle",
            norte_de_santander: "norte_santander",
            san_andres_y_providencia: "san_andres",
          };
          const mapped = alias[norm];
          if (mapped) return departamentos.find((d) => d.id === mapped) || null;
          return null;
        };

        // Nota: el resaltado de la etiqueta se realiza directamente en el listener de clic
        // de cada <text>, por lo que este helper ya no es necesario.

        // Determinar si una forma representa una región (no líneas delgadas)
        const isRegionShapeInline = (el: SVGGraphicsElement): boolean => {
          try {
            const b = el.getBBox();
            const minDim = Math.min(b.width, b.height);
            const area = b.width * b.height;
            const fill = getComputedStyle(el).fill;
            const hasFill = fill && fill !== 'none' && fill !== 'transparent' && !/rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\s*\)/i.test(fill);
            return !!hasFill && minDim >= 5 && area >= 120;
          } catch { return false; }
        };

        // Helper: convierte el centro del rect del elemento a coordenadas del SVG
        const rectCenterToSvgPoint = (svg: SVGSVGElement, el: Element) => {
          const rect = el.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const pt = svg.createSVGPoint();
          pt.x = cx;
          pt.y = cy;
          const ctm = svg.getScreenCTM();
          if (!ctm) return { x: 0, y: 0 } as DOMPoint;
          const inv = ctm.inverse();
          const svgPt = pt.matrixTransform(inv);
          return svgPt as DOMPoint;
        };

        // Determinar rectángulo a ignorar para el recuadro de San Andrés (modo inline)
        const getSanAndresIgnoreRect = (): DOMRect | null => {
          const texts = Array.from(container.querySelectorAll<SVGTextElement>('text'));
          for (const t of texts) {
            const label = (t.textContent || '').replace(/\s+/g, ' ').trim();
            const next = t.nextElementSibling as SVGTextElement | null;
            const prev = t.previousElementSibling as SVGTextElement | null;
            const combinedNext = next && next.tagName.toLowerCase() === 'text' ? `${label} ${(next.textContent || '').trim()}` : null;
            const combinedPrev = prev && prev.tagName.toLowerCase() === 'text' ? `${(prev.textContent || '').trim()} ${label}` : null;
            const dep = (combinedNext && findDepartamento(combinedNext)) || (combinedPrev && findDepartamento(combinedPrev)) || findDepartamento(label);
            if (dep && dep.id === 'san_andres') {
              const r = t.getBoundingClientRect();
              const pad = 60; // Aumentar área para cubrir el recuadro y su símbolo
              return new DOMRect(r.left - pad, r.top - pad, r.width + pad * 2, r.height + pad * 2);
            }
          }
          return null;
        };
        const sanIgnoreRect = getSanAndresIgnoreRect();

        // Helper estricto: asigna data-dept a cada forma usando hit-test y umbral dinámico
        const assignDeptByNearestLabelStrict = () => {
          const svgRoot = container.querySelector('svg') as SVGSVGElement | null;
          if (!svgRoot) return;
          const rawTextEls = Array.from(container.querySelectorAll<SVGTextElement>('text'));
          const textEls = sanIgnoreRect
            ? rawTextEls.filter((t) => {
                const r = t.getBoundingClientRect();
                const inside = r.left >= sanIgnoreRect.left && r.right <= (sanIgnoreRect.left + sanIgnoreRect.width) && r.top >= sanIgnoreRect.top && r.bottom <= (sanIgnoreRect.top + sanIgnoreRect.height);
                return !inside;
              })
            : rawTextEls;
          const rawShapes = Array.from(container.querySelectorAll<SVGGraphicsElement>('path, polygon, polyline')).filter(isRegionShapeInline);
          const shapes = sanIgnoreRect
            ? rawShapes.filter((s) => {
                const r = s.getBoundingClientRect();
                const cx = r.left + r.width / 2;
                const cy = r.top + r.height / 2;
                const inside = cx >= sanIgnoreRect.left && cx <= (sanIgnoreRect.left + sanIgnoreRect.width) && cy >= sanIgnoreRect.top && cy <= (sanIgnoreRect.top + sanIgnoreRect.height);
                return !inside;
              })
            : rawShapes;
          const labelsInfo = textEls.map((t) => {
            const label = (t.textContent || '').replace(/\s+/g, ' ').trim();
            const next = t.nextElementSibling as SVGTextElement | null;
            const prev = t.previousElementSibling as SVGTextElement | null;
            const combinedNext = next && next.tagName.toLowerCase() === 'text' ? `${label} ${(next.textContent || '').trim()}` : null;
            const combinedPrev = prev && prev.tagName.toLowerCase() === 'text' ? `${(prev.textContent || '').trim()} ${label}` : null;
            const dep = (combinedNext && findDepartamento(combinedNext)) || (combinedPrev && findDepartamento(combinedPrev)) || findDepartamento(label);
            let center: DOMPoint | null = null; try { center = rectCenterToSvgPoint(svgRoot, t); } catch { center = null; }
            return { el: t, dep, center };
          }).filter((li) => li.dep && li.center);

          shapes.forEach((sh) => {
            if (sh.getAttribute('data-dept')) return;
            const b = (() => { try { return sh.getBBox(); } catch { return null; } })();
            if (!b || labelsInfo.length === 0) return;
            // 1) Hit-test: probar si el centro del label cae dentro de la forma (coords locales)
            const screenCTM = sh.getScreenCTM();
            let assigned = false;
            if (screenCTM && typeof (sh as any as SVGGeometryElement).isPointInFill === 'function') {
              for (const li of labelsInfo) {
                const inv = screenCTM.inverse();
                const pt = svgRoot.createSVGPoint();
                pt.x = (li.center as DOMPoint).x; pt.y = (li.center as DOMPoint).y;
                const local = pt.matrixTransform(inv);
                try {
                  if (((sh as unknown as SVGGeometryElement) as any).isPointInFill(local)) {
                    sh.setAttribute('data-dept', li.dep!.id);
                    assigned = true; break;
                  }
                } catch (error) {
                  console.error('isPointInFill error', error);
                }
              }
            }
            if (assigned) return;
            // 2) Fallback muy conservador: solo para etiquetas problemáticas con umbral bajo
            const depHardLimit = new Set(['magdalena','atlantico','bolivar','cordoba','sucre']);
            const depExtraTight = new Set(['atlantico','sucre']);
            let best: { depId: string; d: number } | null = null;
            for (const li of labelsInfo) {
              const dx = (li.center as DOMPoint).x - (b.x + b.width / 2);
              const dy = (li.center as DOMPoint).y - (b.y + b.height / 2);
              const d = Math.hypot(dx, dy);
              if (!best || d < best.d) best = { depId: li.dep!.id, d };
            }
            if (best) {
              const maxDim = Math.max(b.width, b.height);
              const base = Math.min(40, maxDim * 0.5);
              const threshold = depExtraTight.has(best.depId)
                ? Math.min(18, maxDim * 0.25)
                : (depHardLimit.has(best.depId) ? Math.min(30, maxDim * 0.4) : base);
              if (best.d <= threshold) sh.setAttribute('data-dept', best.depId);
            }
          });
        };

        // Asignar data-dept de forma estricta para piezas pequeñas
        assignDeptByNearestLabelStrict();
        // Atar eventos a formas (evitar aplicar stroke a grupos grandes)
        const nodes = Array.from(container.querySelectorAll<SVGElement>("path, polygon, polyline, g[data-dept]"))
          .filter((el) => {
            if (!sanIgnoreRect) return true;
            const r = el.getBoundingClientRect();
            const cx = r.left + r.width / 2;
            const cy = r.top + r.height / 2;
            const inside = cx >= sanIgnoreRect.left && cx <= (sanIgnoreRect.left + sanIgnoreRect.width) && cy >= sanIgnoreRect.top && cy <= (sanIgnoreRect.top + sanIgnoreRect.height);
            return !inside;
          });
        nodes.forEach((el) => {
          el.style.cursor = "default";
          el.addEventListener("mouseenter", () => {
            el.classList.add("dept-hover");
          });
          el.addEventListener("mouseleave", () => {
            el.classList.remove("dept-hover");
          });
        });

        // Adicional: hacer clic en etiquetas <text> con nombres de departamentos
        // rectCenterToSvgPoint ya definido arriba
        const textEls = Array.from(container.querySelectorAll<SVGTextElement>("text"));
        // Nota: cálculos de centro transformado se realizan con
        // rectCenterToSvgPointObj() y getScreenCenterObj() en modo <object>.
        // Nota: la asignación global se realiza en assignDeptByNearestLabelStrict(),
        // evitando duplicados y usando umbrales conservadores para piezas contiguas.
        textEls.forEach((t) => {
          const label = (t.textContent || "").trim();
          // Intentar emparejar con el siguiente <text> si el nombre está dividido en dos líneas
          let combined: string | null = null;
          const next = t.nextElementSibling as SVGTextElement | null;
          if (next && next.tagName.toLowerCase() === "text") {
            const nextText = (next.textContent || "").trim();
            if (nextText) combined = `${label} ${nextText}`;
          }
          // También intentar con el anterior si corresponde (ej.: "San Andrés y" + "Providencia")
          const prev = t.previousElementSibling as SVGTextElement | null;
          let prevCombined: string | null = null;
          if (prev && prev.tagName.toLowerCase() === "text") {
            const prevText = (prev.textContent || "").trim();
            if (prevText) prevCombined = `${prevText} ${label}`;
          }

          const dep = (combined && findDepartamento(combined)) || (prevCombined && findDepartamento(prevCombined)) || (label ? findDepartamento(label) : null);
          if (dep) {
            t.style.cursor = "pointer";
          t.addEventListener("click", () => {
            setSeleccion(dep);
            speakDepartamento(dep);
            // Quitar selección previa en nodos y formas
            nodes.forEach((n) => n.classList.remove("dept-selected"));
            const shapesAll = Array.from(container.querySelectorAll<SVGGraphicsElement>("path, polygon, polyline")).filter(isRegionShapeInline);
            const depNormSel = normalize(dep.id);
            const shapesFiltered = shapesAll.filter((sh) => {
              try {
                const bb = sh.getBBox();
                const area = bb.width * bb.height;
                if (depNormSel === "bogota") return area <= 7000; // Bogotá: piezas muy pequeñas
                if (depNormSel === "cundinamarca") return area > 22000; // Cundinamarca: piezas grandes
                return true;
              } catch { return true; }
            });
            shapesAll.forEach((sh) => sh.classList.remove("dept-selected"));
            // Resaltar la etiqueta clicada
            textEls.forEach((tt) => tt.classList.remove("label-selected"));
            t.classList.add("label-selected");
            // Centro del label en coordenadas del SVG para desambiguación
            const svgRoot = container.querySelector('svg') as SVGSVGElement | null;
            let labelCenter: DOMPoint | null = null;
            if (svgRoot && 'createSVGPoint' in svgRoot) {
              try { labelCenter = rectCenterToSvgPoint(svgRoot, t); } catch { labelCenter = null; }
            }
            // Resaltar también la(s) forma(s) del departamento
            // 1) Match por data-dept
            let targetShapes = shapesFiltered.filter((sh) => sh.getAttribute("data-dept") === dep.id);
            // Regla explícita: evitar emparejar Bogotá y Cundinamarca juntos
            if (depNormSel === "bogota" || depNormSel === "cundinamarca") {
              targetShapes = targetShapes.filter((sh) => {
                const dd = normalize(sh.getAttribute("data-dept") || "");
                const idAttr = normalize(sh.getAttribute("id") || "");
                return dd === depNormSel || idAttr.includes(depNormSel);
              });
            }
            // 2) Si no hay data-dept, intentar por id normalizado
            if (targetShapes.length === 0) {
              const normId = normalize(dep.id);
              const normName = normalize(dep.nombre);
              const idMatches = shapesFiltered.filter((sh) => {
                const idAttr = sh.getAttribute("id") || "";
                const normAttr = normalize(idAttr);
                return normAttr === normId || normAttr === normName;
              });
              if (idMatches.length === 1) {
                targetShapes = idMatches;
              } else if (idMatches.length > 1) {
                // Elegir una sola forma: priorizar coincidencia por data-dept y luego cercanía al label
                let chosen: SVGGraphicsElement | null = null;
                const depNorm = normalize(dep.id);
                chosen = (idMatches as SVGGraphicsElement[]).find((el) => {
                  const dd = el.getAttribute('data-dept');
                  return dd && normalize(dd) === depNorm;
                }) || null;
                if (!chosen) {
                  let ax = 0, ay = 0;
                  const tBox = (() => { try { return t.getBBox(); } catch { return null; } })();
                  if (labelCenter) { ax = labelCenter.x; ay = labelCenter.y; }
                  else if (tBox) { ax = tBox.x + tBox.width/2; ay = tBox.y + tBox.height/2; }
                  let bestD = Infinity;
                (idMatches as SVGGraphicsElement[]).forEach((el) => {
                  try {
                    const bb = el.getBBox();
                    const bx = bb.x + bb.width/2; const by = bb.y + bb.height/2;
                    const d = Math.hypot(ax - bx, ay - by);
                    if (d < bestD) { bestD = d; chosen = el; }
                  } catch (error) {
                    console.error('idMatches getBBox error', error);
                  }
                });
                }
                if (!chosen) { chosen = (idMatches as SVGGraphicsElement[])[0] || null; }
                if (chosen) { targetShapes = [chosen]; }
              }
            }
            // Regla final de separación estricta Bogotá/Cundinamarca por área, id/data-dept y distancia al label
            if (targetShapes.length > 0 && (depNormSel === 'bogota' || depNormSel === 'cundinamarca')) {
              let ax = 0, ay = 0;
              const tBoxStrict = (() => { try { return t.getBBox(); } catch { return null; } })();
              if (labelCenter) { ax = labelCenter.x; ay = labelCenter.y; }
              else if (tBoxStrict) { ax = tBoxStrict.x + tBoxStrict.width/2; ay = tBoxStrict.y + tBoxStrict.height/2; }
              const filtered = (targetShapes as SVGGraphicsElement[]).filter((sh) => {
                try {
                  const ddNorm = normalize(sh.getAttribute('data-dept') || '');
                  const idNorm = normalize(sh.getAttribute('id') || '');
                  const bb = sh.getBBox();
                  const area = bb.width * bb.height;
                  const bx = bb.x + bb.width/2; const by = bb.y + bb.height/2;
                  const dist = Math.hypot(ax - bx, ay - by);
                  if (depNormSel === 'bogota') {
                    // Solo piezas pequeñas, muy cercanas al label de Bogotá, y con id/data que indiquen Bogotá
                    return (ddNorm === 'bogota' || idNorm.includes('bogota')) && area <= 9000 && dist <= 120;
                  }
                  // Cundinamarca: excluir explícitamente cualquier pieza con id/data Bogotá, y exigir área grande
                  return ddNorm !== 'bogota' && !idNorm.includes('bogota') && area > 20000 && dist >= 60;
                } catch { return false; }
              });
            if (filtered.length > 0) targetShapes = filtered;
            }
            // Override específico: para Bogotá, elegir estrictamente la pieza con data-dept="bogota" de menor área
            if (normalize(dep.id) === 'bogota') {
              const bogotaPaths = Array.from(container.querySelectorAll<SVGGraphicsElement>('path[data-dept="bogota"], polygon[data-dept="bogota"], polyline[data-dept="bogota"]'));
              if (bogotaPaths.length > 0) {
                let chosen: SVGGraphicsElement | null = null;
                let minArea = Infinity;
                (bogotaPaths as SVGGraphicsElement[]).forEach((el) => {
                  try {
                    const bb = el.getBBox();
                    const area = bb.width * bb.height;
                    if (area < minArea) { minArea = area; chosen = el; }
                  } catch (error) {
                    console.error('bogotaPaths getBBox error', error);
                  }
                });
                if (chosen) targetShapes = [chosen];
              }
            }
            // Si data-dept devolvió múltiples piezas, reducir a una por cercanía al nombre
            if (targetShapes.length > 1) {
              let ax = 0, ay = 0;
              const tBox = (() => { try { return t.getBBox(); } catch { return null; } })();
              if (labelCenter) { ax = labelCenter.x; ay = labelCenter.y; }
              else if (tBox) { ax = tBox.x + tBox.width/2; ay = tBox.y + tBox.height/2; }
              let chosen: SVGGraphicsElement | null = null;
              if (normalize(dep.id) === 'bogota') {
                chosen = (targetShapes as SVGGraphicsElement[]).find((el) => normalize(el.getAttribute('id') || '').includes('bogota')) || null;
              }
              if (!chosen) {
                let bestD = Infinity;
                (targetShapes as SVGGraphicsElement[]).forEach((el) => {
                  try {
                    const bb = el.getBBox();
                    const bx = bb.x + bb.width/2; const by = bb.y + bb.height/2;
                    const d = Math.hypot(ax - bx, ay - by);
                    if (d < bestD) { bestD = d; chosen = el; }
                  } catch (error) {
                    console.error('targetShapes getBBox error', error);
                  }
                });
              }
              if (chosen) targetShapes = [chosen]; else targetShapes = [targetShapes[0]] as SVGGraphicsElement[];
            }
            // 3) Si sigue vacío, intentar hit-test geométrico (isPointInFill) en coords del elemento
            if (targetShapes.length === 0) {
              const svgRoot2 = container.querySelector('svg') as SVGSVGElement | null;
              if (svgRoot2 && 'createSVGPoint' in svgRoot2) {
                let center: DOMPoint | null = labelCenter;
                if (!center) { try { center = rectCenterToSvgPoint(svgRoot2, t); } catch { center = null; } }
                if (center) {
                  const geomMatches = shapesAll.filter((sh) => {
                    try {
                      const geom = sh as unknown as SVGGeometryElement;
                      const screenCTM = sh.getScreenCTM();
                      if (screenCTM && typeof (geom as any).isPointInFill === 'function') {
                        const inv = screenCTM.inverse();
                        const pt = svgRoot2.createSVGPoint();
                        pt.x = center!.x; pt.y = center!.y;
                        const local = pt.matrixTransform(inv);
                        return (geom as any).isPointInFill(local);
                      }
                      return false;
                    } catch { return false; }
                  });
                  if (geomMatches.length > 0) {
                    // Elegir solo una forma, usando data-dept o cercanía al centro del label
                    let chosen: SVGGraphicsElement | null = null;
                    const depNorm = normalize(dep.id);
                    const candidates = geomMatches as SVGGraphicsElement[];
                    chosen = candidates.find((el) => {
                      const dd = el.getAttribute('data-dept');
                      return dd && normalize(dd) === depNorm;
                    }) || null;
                    if (!chosen) {
                      let ax = 0, ay = 0;
                      const tBox = (() => { try { return t.getBBox(); } catch { return null; } })();
                      if (labelCenter) { ax = labelCenter.x; ay = labelCenter.y; }
                      else if (tBox) { ax = tBox.x + tBox.width/2; ay = tBox.y + tBox.height/2; }
                      let bestD = Infinity;
                      candidates.forEach((el) => {
                        try {
                          const bb = el.getBBox();
                          const bx = bb.x + bb.width/2; const by = bb.y + bb.height/2;
                          const d = Math.hypot(ax - bx, ay - by);
                          if (d < bestD) { bestD = d; chosen = el; }
                        } catch (error) {
                          console.error('candidates getBBox error', error);
                        }
                      });
                    }
                    if (chosen) { targetShapes = [chosen]; }
                  }
                }
              }
            }
            // 4) Si sigue vacío, escoger la forma más cercana al label con umbral y validación
            if (targetShapes.length === 0) {
              let bestEl: SVGGraphicsElement | null = null;
              let bestD = Infinity;
              let tBox: DOMRect | null = null;
              try { tBox = t.getBBox(); } catch { tBox = null; }
              if (tBox || labelCenter) {
                shapesAll.forEach((sh) => {
                  try {
                    const b = sh.getBBox();
                    const ax = labelCenter ? labelCenter.x : (tBox!.x + tBox!.width / 2);
                    const ay = labelCenter ? labelCenter.y : (tBox!.y + tBox!.height / 2);
                    const bx = b.x + b.width / 2;
                    const by = b.y + b.height / 2;
                    const dx = ax - bx;
                    const dy = ay - by;
                    const d = Math.sqrt(dx * dx + dy * dy);
                    if (d < bestD) { bestD = d; bestEl = sh; }
                  } catch (error) {
                    console.error('shapesAll getBBox error', error);
                  }
                });
              }
              if (bestEl) {
                let maxDim = 0; try { const bb = (bestEl as SVGGraphicsElement).getBBox(); maxDim = Math.max(bb.width, bb.height); } catch (error) { console.error('bestEl getBBox error', error); }
                const depHardLimit = new Set(['magdalena','atlantico','bolivar','cordoba','sucre']);
                const depExtraRelax = new Set(['atlantico','sucre']);
                const base = Math.min(40, maxDim * 0.5);
                const threshold = depExtraRelax.has(normalize(dep.id))
                  ? Math.min(50, maxDim * 0.55)
                  : (depHardLimit.has(normalize(dep.id)) ? Math.min(34, maxDim * 0.45) : base);
                const dd = (bestEl as SVGGraphicsElement).getAttribute('data-dept');
                if (bestD <= threshold && (!dd || normalize(dd) === normalize(dep.id))) {
                  targetShapes = [bestEl];
                }
                // Último recurso seguro: permitir el más cercano si está razonablemente cerca del label
                if (targetShapes.length === 0) {
                  const safeCap = Math.max(60, maxDim * 0.8);
                  if (bestD <= safeCap) targetShapes = [bestEl];
                }
              }
            }
            // 5) Si la forma está dentro de un grupo, resaltar sólo grupos pequeños
            if (targetShapes.length > 0) {
              const parentGroup = targetShapes[0].closest('g');
              if (parentGroup) {
                // En lugar de resaltar todo el grupo, elegir la hija más cercana al centro
                const childShapes = Array.from(parentGroup.querySelectorAll<SVGGraphicsElement>('path, polygon, polyline')).filter(isRegionShapeInline);
                let chosen: SVGGraphicsElement | null = null;
                try {
                  const tb = (() => { try { return t.getBBox(); } catch { return null; } })();
                  const gx = labelCenter ? labelCenter.x : (tb ? tb.x + tb.width/2 : 0);
                  const gy = labelCenter ? labelCenter.y : (tb ? tb.y + tb.height/2 : 0);
                  let bestD = Infinity;
                  childShapes.forEach((s)=>{ try { const bs = s.getBBox(); const dx = gx - (bs.x+bs.width/2); const dy = gy - (bs.y+bs.height/2); const d = Math.hypot(dx,dy); if (d < bestD) { bestD = d; chosen = s; } } catch (error) { console.error('childShapes getBBox error', error); } });
                } catch (error) {
                  console.error('parentGroup inline selection error', error);
                }
                (chosen ? [chosen] : targetShapes).forEach((sh) => sh.classList.add('dept-selected'));
              } else {
                // Si no hay grupo padre, resaltar solamente las formas seleccionadas
                targetShapes.forEach((sh) => sh.classList.add("dept-selected"));
              }
            }
            // Evitar doble aplicación del resaltado cuando hay un grupo padre
          });
          }
        });

        // Auto-etiquetado reemplazado por asignación global arriba
      } catch (e) {
        console.error('fetchSvg error; fallback to <object> mode', e);
        // Fallback: insertar como <object> embebido si el fetch o el parse fallan
        const container = svgContainerRef.current;
        if (!container) { setSvgDisponible(false); return; }
        const obj: HTMLObjectElement = document.createElement("object");
        obj.type = "image/svg+xml";
        obj.data = "/Colombia.svg";
        obj.style.width = "100%";
        obj.style.maxWidth = "900px";
        obj.onload = () => {
          try {
            const doc = obj.contentDocument;
            if (doc) {
              const svg = doc.querySelector('svg');
              if (svg) {
                const style = doc.createElement('style');
                style.textContent = `.dept-hover { filter: brightness(1.06) drop-shadow(0 1px 0 rgba(0,0,0,0.2)); transition: filter 0.2s ease; }
                .dept-selected { stroke: #10b981 !important; stroke-width: 4 !important; vector-effect: non-scaling-stroke; filter: drop-shadow(0 2px 0 rgba(0,0,0,0.4)) drop-shadow(0 10px 10px rgba(0,0,0,0.28)); transform: translateY(-1px) scale(1.012); transition: filter 0.2s ease, transform 0.2s ease; }
                .label-selected { fill: #10b981; font-weight: 700; }`;
                svg.appendChild(style);
              }

              // Replicar interacción usando el documento del <object>
              const normalize = (s: string) =>
                s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[_\s]+/g, "_").trim();
              const findDepartamento = (raw: string) => {
                const norm = normalize(raw);
                let dep = departamentos.find((d) => normalize(d.id) === norm);
                if (dep) return dep;
                dep = departamentos.find((d) => normalize(d.nombre) === norm);
                if (dep) return dep;
                const alias: Record<string, string> = { narino: "narinio", cesar: "cesar", valle_del_cauca: "valle", norte_de_santander: "norte_santander", san_andres_y_providencia: "san_andres" };
                const mapped = alias[norm];
                if (mapped) return departamentos.find((d) => d.id === mapped) || null;
                return null;
              };
              // Nota: el resaltado de etiqueta en modo <object> se maneja directamente
              // en los listeners de clic de cada <text>; no se requiere helper.

              // Determinar si una forma representa una región (modo <object>)
              const isRegionShapeObj = (el: SVGGraphicsElement): boolean => {
                try {
                  const b = el.getBBox();
                  const minDim = Math.min(b.width, b.height);
                  const area = b.width * b.height;
                  const view = doc.defaultView || window;
                  const fill = view.getComputedStyle(el).fill;
                  const hasFill = fill && fill !== 'none' && fill !== 'transparent' && !/rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\s*\)/i.test(fill);
                  return !!hasFill && minDim >= 5 && area >= 120;
                } catch { return false; }
              };

              // Determinar rectángulo a ignorar para el recuadro de San Andrés (modo <object>)
              const getSanAndresIgnoreRectObj = (): DOMRect | null => {
                const texts = Array.from(doc.querySelectorAll<SVGTextElement>('text'));
                for (const t of texts) {
                  const label = (t.textContent || '').trim();
                  const next = t.nextElementSibling as SVGTextElement | null;
                  const prev = t.previousElementSibling as SVGTextElement | null;
                  const combinedNext = next && next.tagName.toLowerCase() === 'text' ? `${label} ${(next.textContent || '').trim()}` : null;
                  const combinedPrev = prev && prev.tagName.toLowerCase() === 'text' ? `${(prev.textContent || '').trim()} ${label}` : null;
                  const dep = (combinedNext && findDepartamento(combinedNext)) || (combinedPrev && findDepartamento(combinedPrev)) || findDepartamento(label);
                  if (dep && dep.id === 'san_andres') {
                    const r = t.getBoundingClientRect();
                    const pad = 60;
                    return new DOMRect(r.left - pad, r.top - pad, r.width + pad * 2, r.height + pad * 2);
                  }
                }
                return null;
              };
              const sanIgnoreRectObj = getSanAndresIgnoreRectObj();

              // Asignación de data-dept por etiqueta más cercana (modo <object>)
              const rawTextForAssign = Array.from(doc.querySelectorAll<SVGTextElement>('text'));
              const textForAssign = sanIgnoreRectObj
                ? rawTextForAssign.filter((t) => {
                    const r = t.getBoundingClientRect();
                    const inside = r.left >= sanIgnoreRectObj.left && r.right <= (sanIgnoreRectObj.left + sanIgnoreRectObj.width) && r.top >= sanIgnoreRectObj.top && r.bottom <= (sanIgnoreRectObj.top + sanIgnoreRectObj.height);
                    return !inside;
                  })
                : rawTextForAssign;
              const rawShapesForAssign = Array.from(doc.querySelectorAll<SVGGraphicsElement>('path, polygon, polyline')).filter(isRegionShapeObj);
              const shapesForAssign = sanIgnoreRectObj
                ? rawShapesForAssign.filter((s) => {
                    const r = s.getBoundingClientRect();
                    const cx = r.left + r.width / 2;
                    const cy = r.top + r.height / 2;
                    const inside = cx >= sanIgnoreRectObj.left && cx <= (sanIgnoreRectObj.left + sanIgnoreRectObj.width) && cy >= sanIgnoreRectObj.top && cy <= (sanIgnoreRectObj.top + sanIgnoreRectObj.height);
                    return !inside;
                  })
                : rawShapesForAssign;
              const getScreenCenterObj = (el: SVGGraphicsElement): { x: number; y: number } | null => {
                try {
                  const box = el.getBBox();
                  const ctm = el.getScreenCTM();
                  if (!ctm) return null;
                  const pt = (el.ownerSVGElement || (el as any).nearestViewportElement)?.createSVGPoint();
                  if (!pt) return null;
                  pt.x = box.x + box.width / 2; pt.y = box.y + box.height / 2;
                  const res = pt.matrixTransform(ctm);
                  return { x: res.x, y: res.y };
                } catch { return null; }
              };
              try {
                const labelsInfo = textForAssign.map((t) => {
                  const label = (t.textContent || '').replace(/\s+/g, ' ').trim();
                  const next = t.nextElementSibling as SVGTextElement | null;
                  const prev = t.previousElementSibling as SVGTextElement | null;
                  const combinedNext = next && next.tagName.toLowerCase() === 'text' ? `${label} ${(next.textContent || '').trim()}` : null;
                  const combinedPrev = prev && prev.tagName.toLowerCase() === 'text' ? `${(prev.textContent || '').trim()} ${label}` : null;
                  const dep = (combinedNext && findDepartamento(combinedNext)) || (combinedPrev && findDepartamento(combinedPrev)) || findDepartamento(label);
                  return { el: t, depId: dep?.id || null, center: getScreenCenterObj(t as unknown as SVGGraphicsElement) };
                }).filter((li) => li.depId && li.center);
                shapesForAssign.forEach((sh) => {
                  if (sh.getAttribute('data-dept')) return;
                  const sc = getScreenCenterObj(sh);
                  if (!sc || labelsInfo.length === 0) return;
                  let best = labelsInfo[0];
                  let bestD = Infinity;
                  for (const li of labelsInfo) {
                    const dx = (li.center as any).x - sc.x; const dy = (li.center as any).y - sc.y;
                    const d = Math.hypot(dx, dy);
                    if (d < bestD) { bestD = d; best = li as any; }
                  }
                  if (best && best.depId) {
                    // Umbral más estricto para departamentos conflictivos
                    let maxDim = 0;
                    try { const bb = sh.getBBox(); maxDim = Math.max(bb.width, bb.height); } catch (error) { console.error('shapesForAssign getBBox error', error); }
                    const base = Math.min(40, maxDim * 0.5);
                    const depHardLimit = new Set(['magdalena','atlantico','bolivar','cordoba','sucre']);
                    const depExtraTight = new Set(['atlantico','sucre']);
                    const threshold = depExtraTight.has(best.depId)
                      ? Math.min(18, maxDim * 0.25)
                      : (depHardLimit.has(best.depId) ? Math.min(30, maxDim * 0.4) : base);
                    if (bestD <= threshold) sh.setAttribute('data-dept', best.depId);
                  }
                });
              } catch (error) {
                console.error('Asignación data-dept (object) error', error);
              }

              const nodes = Array.from(doc.querySelectorAll<SVGElement>("path, polygon, polyline, g[data-dept]"))
                .filter((el) => {
                  if (!sanIgnoreRectObj) return true;
                  const r = el.getBoundingClientRect();
                  const cx = r.left + r.width / 2;
                  const cy = r.top + r.height / 2;
                  const inside = cx >= sanIgnoreRectObj.left && cx <= (sanIgnoreRectObj.left + sanIgnoreRectObj.width) && cy >= sanIgnoreRectObj.top && cy <= (sanIgnoreRectObj.top + sanIgnoreRectObj.height);
                  return !inside;
                });
              nodes.forEach((el) => {
                el.style.cursor = "default";
              });

              const textEls = Array.from(doc.querySelectorAll<SVGTextElement>('text'));
              const shapeEls = Array.from(doc.querySelectorAll<SVGGraphicsElement>('path, polygon, polyline')).filter(isRegionShapeObj);
              const rectCenterToSvgPointObj = (svgEl: SVGSVGElement, el: Element) => {
                const rect = el.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                const pt = svgEl.createSVGPoint();
                pt.x = cx; pt.y = cy;
                const ctm = svgEl.getScreenCTM();
                if (!ctm) return { x: 0, y: 0 } as DOMPoint;
                const inv = ctm.inverse();
                const svgPt = pt.matrixTransform(inv);
                return svgPt as DOMPoint;
              };
              // Asignación estricta de data-dept por etiqueta más cercana con hit-test
              try {
                const labelsInfo = textEls.map((t) => {
                  const label = (t.textContent || '').replace(/\s+/g, ' ').trim();
                  const next = t.nextElementSibling as SVGTextElement | null;
                  const prev = t.previousElementSibling as SVGTextElement | null;
                  const combinedNext = next && next.tagName.toLowerCase() === 'text' ? `${label} ${(next.textContent || '').trim()}` : null;
                  const combinedPrev = prev && prev.tagName.toLowerCase() === 'text' ? `${(prev.textContent || '').trim()} ${label}` : null;
                  const dep = (combinedNext && findDepartamento(combinedNext)) || (combinedPrev && findDepartamento(combinedPrev)) || findDepartamento(label);
                  let center: DOMPoint | null = null; const svgEl = doc.querySelector('svg') as SVGSVGElement | null;
                  if (svgEl) { try { center = rectCenterToSvgPointObj(svgEl, t); } catch { center = null; } }
                  return { dep, center };
                }).filter((li) => li.dep && li.center);
                shapeEls.forEach((sh) => {
                  if (sh.getAttribute('data-dept')) return;
                  const b = (() => { try { return sh.getBBox(); } catch { return null; } })();
                  if (!b || labelsInfo.length === 0) return;
                  const screenCTM = sh.getScreenCTM();
                  let assignedLocal = false;
                  if (screenCTM && typeof (sh as any as SVGGeometryElement).isPointInFill === 'function') {
                    const svgEl = doc.querySelector('svg') as SVGSVGElement | null;
                    for (const li of labelsInfo) {
                      const inv = screenCTM.inverse();
                      const pt = svgEl!.createSVGPoint();
                      pt.x = (li.center as DOMPoint).x; pt.y = (li.center as DOMPoint).y;
                      const local = pt.matrixTransform(inv);
                      try {
                        if (((sh as unknown as SVGGeometryElement) as any).isPointInFill(local)) {
                          sh.setAttribute('data-dept', li.dep!.id);
                          assignedLocal = true; break;
                        }
                      } catch (error) {
                        console.error('isPointInFill error during local assignment', error);
                      }
                    }
                  }
                  if (assignedLocal) return;
                  let bestId: string | null = null; let bestD = Infinity;
                  for (const li of labelsInfo) {
                    const dx = (li.center as DOMPoint).x - (b.x + b.width / 2);
                    const dy = (li.center as DOMPoint).y - (b.y + b.height / 2);
                    const d = Math.hypot(dx, dy);
                    if (d < bestD) { bestD = d; bestId = li.dep!.id; }
                  }
                  if (bestId) {
                    const depHardLimit = new Set(['magdalena','atlantico','bolivar','cordoba','sucre']);
                    const depExtraTight = new Set(['atlantico','sucre']);
                    const maxDim = Math.max(b.width, b.height);
                    const base = Math.min(40, maxDim * 0.5);
                    const threshold = depExtraTight.has(bestId)
                      ? Math.min(18, maxDim * 0.25)
                      : (depHardLimit.has(bestId) ? Math.min(30, maxDim * 0.4) : base);
                    if (bestD <= threshold) sh.setAttribute('data-dept', bestId);
                  }
                });
              } catch (error) {
                console.error('Asignación estricta data-dept (object) error', error);
              }
              textEls.forEach((t) => {
                const label = (t.textContent || '').trim();
                const next = t.nextElementSibling as SVGTextElement | null;
                const prev = t.previousElementSibling as SVGTextElement | null;
                const combinedNext = next && next.tagName.toLowerCase() === 'text' ? `${label} ${(next.textContent || '').trim()}` : null;
                const combinedPrev = prev && prev.tagName.toLowerCase() === 'text' ? `${(prev.textContent || '').trim()} ${label}` : null;
              const dep = (combinedNext && findDepartamento(combinedNext)) || (combinedPrev && findDepartamento(combinedPrev)) || findDepartamento(label);
              if (!dep) return;
              t.style.cursor = 'pointer';
              t.addEventListener('click', () => {
                setSeleccion(dep);
                speakDepartamento(dep);
                nodes.forEach((n) => n.classList.remove('dept-selected'));
                // Quitar selección previa en formas
                const shapesAll = Array.from(doc.querySelectorAll<SVGGraphicsElement>('path, polygon, polyline')).filter(isRegionShapeObj);
                shapesAll.forEach((sh) => sh.classList.remove('dept-selected'));
                textEls.forEach((tt) => tt.classList.remove('label-selected'));
                t.classList.add('label-selected');
                // Centro del label en coordenadas del SVG (corrige errores por transformaciones)
                const svgElRoot = doc.querySelector('svg') as SVGSVGElement | null;
                let labelCenter: DOMPoint | null = null;
                if (svgElRoot && 'createSVGPoint' in svgElRoot) {
                  try { labelCenter = rectCenterToSvgPointObj(svgElRoot, t); } catch { labelCenter = null; }
                }
                // Resaltar también la(s) forma(s) del departamento
                // 1) Match por data-dept
                let targetShapes = shapesAll.filter((sh) => sh.getAttribute('data-dept') === dep.id);
                // 2) Si no hay data-dept, intentar por id normalizado
                if (targetShapes.length === 0) {
                  const normId = normalize(dep.id);
                  const normName = normalize(dep.nombre);
                  const idMatches = shapesAll.filter((sh) => {
                    const idAttr = sh.getAttribute('id') || '';
                    const normAttr = normalize(idAttr);
                    return normAttr === normId || normAttr === normName;
                  });
                  if (idMatches.length === 1) {
                    targetShapes = idMatches;
                  } else if (idMatches.length > 1) {
                    // Si hay múltiples por id, elegir uno solo por data-dept o cercanía al label
                    let chosen: SVGGraphicsElement | null = null;
                    let tBox: DOMRect | null = null;
                    try { tBox = t.getBBox(); } catch { tBox = null; }
                    const depNorm = normalize(dep.id);
                    chosen = (idMatches as SVGGraphicsElement[]).find((el) => {
                      const dd = el.getAttribute('data-dept');
                      return dd && normalize(dd) === depNorm;
                    }) || null;
                    if (!chosen && tBox) {
                      const ax = labelCenter ? labelCenter.x : (tBox.x + tBox.width / 2);
                      const ay = labelCenter ? labelCenter.y : (tBox.y + tBox.height / 2);
                      let bestD = Infinity;
                      (idMatches as SVGGraphicsElement[]).forEach((el) => {
                        try {
                          const bb = el.getBBox();
                          const bx = bb.x + bb.width / 2;
                          const by = bb.y + bb.height / 2;
                          const d = Math.hypot(ax - bx, ay - by);
                          if (d < bestD) { bestD = d; chosen = el; }
                        } catch (error) {
                          console.error('idMatches getBBox error', error);
                        }
                      });
                    }
                    if (!chosen) { chosen = (idMatches as SVGGraphicsElement[])[0] || null; }
                    if (chosen) { targetShapes = [chosen]; }
                  }
                }
                // 3) Si sigue vacío, intentar hit-test geométrico con transformación CTM
                if (targetShapes.length === 0) {
                  const svgEl = doc.querySelector('svg') as SVGSVGElement | null;
                  if (svgEl && 'createSVGPoint' in svgEl) {
                    let center: DOMPoint | null = labelCenter;
                    if (!center) { try { center = rectCenterToSvgPointObj(svgEl, t); } catch { center = null; } }
                    if (center) {
                  const geomMatches = shapesAll.filter((sh) => {
                    try {
                      const geom = sh as unknown as SVGGeometryElement;
                      const screenCTM = sh.getScreenCTM();
                      if (screenCTM && typeof (geom as any).isPointInFill === 'function') {
                        const inv = screenCTM.inverse();
                        const pt = svgEl.createSVGPoint();
                        pt.x = center!.x; pt.y = center!.y;
                        const local = pt.matrixTransform(inv);
                        return (geom as any).isPointInFill(local);
                      }
                      return false;
                    } catch { return false; }
                  });
                      if (geomMatches.length > 0) {
                        // Elegir una sola forma: priorizar coincidencia por data-dept y luego cercanía al label
                        let chosen: SVGGraphicsElement | null = null;
                        let tBox: DOMRect | null = null;
                        try { tBox = t.getBBox(); } catch { tBox = null; }
                        const depNorm = normalize(dep.id);
                        const candidates = geomMatches as SVGGraphicsElement[];
                        // Primero intenta por data-dept exacta
                        chosen = candidates.find((el) => {
                          const dd = el.getAttribute('data-dept');
                          return dd && normalize(dd) === depNorm;
                        }) || null;
                        if (!chosen) {
                          // Si no hay data-dept que coincida, elegir por distancia al centro del label
                          if (tBox) {
                            let bestD = Infinity;
                            const ax = labelCenter ? labelCenter.x : (tBox.x + tBox.width / 2);
                            const ay = labelCenter ? labelCenter.y : (tBox.y + tBox.height / 2);
                            candidates.forEach((el) => {
                              try {
                                const bb = el.getBBox();
                                const bx = bb.x + bb.width / 2;
                                const by = bb.y + bb.height / 2;
                                const d = Math.hypot(ax - bx, ay - by);
                                if (d < bestD) { bestD = d; chosen = el; }
                              } catch (error) {
                                console.error('candidates getBBox error', error);
                              }
                            });
                          } else {
                            // Como último recurso, tomar el primero
                            chosen = candidates[0] || null;
                          }
                        }
                        if (chosen) {
                          targetShapes = [chosen];
                        }
                      }
                    }
                  }
                }
                // 4) Si sigue vacío, escoger la forma más cercana al label con umbral estricto
                if (targetShapes.length === 0) {
                  let bestEl: SVGGraphicsElement | null = null;
                  let bestD = Infinity;
                  let tBox: DOMRect | null = null;
                  try { tBox = t.getBBox(); } catch { tBox = null; }
                  if (tBox || labelCenter) {
                    shapesAll.forEach((sh) => {
                      try {
                        const b = sh.getBBox();
                        const ax = labelCenter ? labelCenter.x : (tBox!.x + tBox!.width / 2);
                        const ay = labelCenter ? labelCenter.y : (tBox!.y + tBox!.height / 2);
                        const bx = b.x + b.width / 2;
                        const by = b.y + b.height / 2;
                        const dx = ax - bx;
                        const dy = ay - by;
                        const d = Math.sqrt(dx * dx + dy * dy);
                        if (d < bestD) { bestD = d; bestEl = sh; }
                      } catch (error) {
                        console.error('shapesAll getBBox error', error);
                      }
                    });
                  }
                  if (bestEl) {
                    let maxDim = 0; try { const bb = (bestEl as SVGGraphicsElement).getBBox(); maxDim = Math.max(bb.width, bb.height); } catch (error) { console.error('bestEl getBBox error (object)', error); }
                    const depHardLimit = new Set(['magdalena','atlantico','bolivar','cordoba','sucre']);
                    const depExtraRelax = new Set(['atlantico','sucre']);
                    const base = Math.min(40, maxDim * 0.5);
                    const threshold = depExtraRelax.has(normalize(dep.id))
                      ? Math.min(50, maxDim * 0.55)
                      : (depHardLimit.has(normalize(dep.id)) ? Math.min(34, maxDim * 0.45) : base);
                    const dd = (bestEl as SVGGraphicsElement).getAttribute('data-dept');
                    if (bestD <= threshold && (!dd || normalize(dd) === normalize(dep.id))) {
                      targetShapes = [bestEl];
                    }
                    // Último recurso: si nada entró por umbral, usar el más cercano si está razonablemente cerca del label
                    if (targetShapes.length === 0) {
                      const safeCap = Math.max(60, maxDim * 0.8);
                      if (bestD <= safeCap) targetShapes = [bestEl];
                    }
                  }
                }
                // Regla final de separación estricta Bogotá/Cundinamarca por área e id/data-dept + distancia
                {
                  const depNormSel = normalize(dep.id);
                  if (targetShapes.length > 0 && (depNormSel === 'bogota' || depNormSel === 'cundinamarca')) {
                    let ax = 0, ay = 0;
                    const tb = (() => { try { return t.getBBox(); } catch { return null; } })();
                    if (labelCenter) { ax = labelCenter.x; ay = labelCenter.y; }
                    else if (tb) { ax = tb.x + tb.width/2; ay = tb.y + tb.height/2; }
                    const filtered = (targetShapes as SVGGraphicsElement[]).filter((sh) => {
                      try {
                        const ddNorm = normalize(sh.getAttribute('data-dept') || '');
                        const idNorm = normalize(sh.getAttribute('id') || '');
                        const bb = sh.getBBox();
                        const area = bb.width * bb.height;
                        const bx = bb.x + bb.width/2; const by = bb.y + bb.height/2;
                        const dist = Math.hypot(ax - bx, ay - by);
                        if (depNormSel === 'bogota') {
                          return (ddNorm === 'bogota' || idNorm.includes('bogota')) && area <= 9000 && dist <= 120;
                        }
                        return ddNorm !== 'bogota' && !idNorm.includes('bogota') && area > 20000 && dist >= 60;
                      } catch { return false; }
                    });
                    if (filtered.length > 0) targetShapes = filtered;
                  }
                }
                // Override específico: para Bogotá, elegir estrictamente la pieza con data-dept="bogota" de menor área
                {
                  const depNormSel = normalize(dep.id);
                  if (depNormSel === 'bogota') {
                    const bogotaPaths = Array.from(doc.querySelectorAll<SVGGraphicsElement>('path[data-dept="bogota"], polygon[data-dept="bogota"], polyline[data-dept="bogota"]'));
                    if (bogotaPaths.length > 0) {
                      let chosen: SVGGraphicsElement | null = null;
                      let minArea = Infinity;
                      (bogotaPaths as SVGGraphicsElement[]).forEach((el) => {
                        try {
                          const bb = el.getBBox();
                          const area = bb.width * bb.height;
                          if (area < minArea) { minArea = area; chosen = el; }
                        } catch (error) {
                          console.error('bogotaPaths getBBox error', error);
                        }
                      });
                      if (chosen) targetShapes = [chosen];
                    }
                  }
                }
                // 5) Si la forma está dentro de un grupo, resaltar sólo grupos pequeños
                if (targetShapes.length > 0) {
                  const parentGroup = targetShapes[0].closest('g');
                  if (parentGroup) {
                    // Elegir la hija más cercana al centro del label en vez del centro del grupo
                    const childShapes = Array.from(parentGroup.querySelectorAll<SVGGraphicsElement>('path, polygon, polyline')).filter(isRegionShapeObj);
                    let chosen: SVGGraphicsElement | null = null;
                    try {
                      const tb = (() => { try { return t.getBBox(); } catch { return null; } })();
                      const ax = labelCenter ? labelCenter.x : (tb ? tb.x + tb.width/2 : 0);
                      const ay = labelCenter ? labelCenter.y : (tb ? tb.y + tb.height/2 : 0);
                      let bestGD = Infinity;
                      childShapes.forEach((s) => {
                        try {
                          const bs = s.getBBox(); const bx = bs.x + bs.width/2; const by = bs.y + bs.height/2;
                          const d = Math.hypot(ax - bx, ay - by);
                          const dd = s.getAttribute('data-dept');
                          // Priorizar coincidencia de data-dept cuando esté disponible
                          const prefer = dd && normalize(dd) === normalize(dep.id);
                          const score = prefer ? d * 0.5 : d;
                          if (score < bestGD) { bestGD = score; chosen = s; }
                        } catch (error) {
                          console.error('childShapes getBBox error', error);
                        }
                      });
                    } catch (error) {
                      console.error('parentGroup selection/centering error', error);
                    }
                    (chosen ? [chosen] : targetShapes).forEach((sh) => sh.classList.add('dept-selected'));
                  }
                }
                // Ya se resaltó la forma adecuada arriba; evitar resaltar múltiples accidentalmente
              });
                });
            }
          } catch (error) {
            console.error('SVG processing error', error);
          }
          setSvgDisponible(true);
          setSvgLoaded(true);
        };
        const wrapper2 = zoomWrapperRef.current;
        if (wrapper2) {
          wrapper2.innerHTML = "";
          wrapper2.appendChild(obj);
        }
      }
    };
    fetchSvg();
  }, []);

  // Wheel-zoom: Ctrl + rueda para acercar/alejar
  useEffect(() => {
    const container = svgContainerRef.current;
    if (!container) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      const delta = Math.sign(e.deltaY);
      setZoom((z) => {
        const next = delta > 0 ? z * 0.92 : z * 1.08;
        return Math.max(0.5, Math.min(3, parseFloat(next.toFixed(2))));
      });
    };
    container.addEventListener('wheel', onWheel as any, { passive: false } as any);
    return () => container.removeEventListener('wheel', onWheel as any);
  }, []);

  // Modo pan: arrastrar con botón medio/derecho, o manteniendo Space (sin romper clics)
  const [isSpaceDown, setIsSpaceDown] = useState(false);
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => { if (e.code === 'Space') setIsSpaceDown(true); };
    const onKeyUp = (e: KeyboardEvent) => { if (e.code === 'Space') setIsSpaceDown(false); };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useEffect(() => {
    const panel = panelRef.current;
    const container = svgContainerRef.current;
    const obj = objectElRef.current;
    const wrapper = zoomWrapperRef.current;
    if (!panel || !wrapper) return;
    let isDown = false;
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let baseX = 0;
    let baseY = 0;
    const startDrag = (e: PointerEvent) => {
      // Permitir pan con botón izquierdo en cualquier zoom (umbral protege clics),
      // además de botón medio/derecho o Space+izquierdo
      const allow = (e.button === 0 || e.button === 1 || e.button === 2 || (isSpaceDown && e.button === 0));
      if (!allow) return;
      // No prevenir por defecto aún; sólo si se supera el umbral de movimiento
      isDown = true;
      isDragging = false;
      isDraggingRef.current = false;
      baseX = pan.x; baseY = pan.y;
      startX = e.clientX; startY = e.clientY;
      // Mantener una transición corta durante el arrastre para continuidad visual
      (wrapper.style as any).transition = 'transform 80ms linear';
      (wrapper.style as any).cursor = 'grabbing';
    };
    const moveDrag = (e: PointerEvent) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      // Umbral para considerar que es arrastre (evitar interferir con clics leves)
      const threshold = DRAG_THRESHOLD;
      if (!isDragging && (Math.abs(dx) > threshold || Math.abs(dy) > threshold)) {
        isDragging = true;
        isDraggingRef.current = true;
        e.preventDefault();
      }
      // Sensibilidad de pan: aún más alta con mayor zoom.
      // Fórmula: factor = base * zoom^2 (base=20).
      // Ejemplos: zoom=1 -> 20x, zoom=2 -> 80x, zoom=3 -> 180x
      const factor = panFactor(zoom);
      setPan({ x: baseX + dx * factor, y: baseY + dy * factor });
    };
    const endDrag = () => {
      if (!isDown) return;
      isDown = false;
      isDraggingRef.current = false;
      (wrapper.style as any).transition = 'transform 200ms ease-in-out';
      (wrapper.style as any).cursor = 'grab';
    };
    // Listeners en el panel (área completa) y también en el contenedor/<object>
    panel.addEventListener('pointerdown', startDrag);
    panel.addEventListener('pointermove', moveDrag);
    if (container) {
      container.addEventListener('pointerdown', startDrag);
      container.addEventListener('pointermove', moveDrag);
    }
    window.addEventListener('pointerup', endDrag);
    if (obj) {
      obj.addEventListener('pointerdown', startDrag);
      obj.addEventListener('pointermove', moveDrag);
    }
    (wrapper.style as any).cursor = 'grab';
    (panel.style as any).cursor = 'grab';
    const preventMenu = (e: MouseEvent) => { if (zoom > 1) e.preventDefault(); };
    panel.addEventListener('contextmenu', preventMenu);
    const onDblClick = () => resetView();
    panel.addEventListener('dblclick', onDblClick);
    const onKey = (e: KeyboardEvent) => { if (e.code === 'KeyR') resetView(); };
    window.addEventListener('keydown', onKey);
    return () => {
      panel.removeEventListener('pointerdown', startDrag);
      panel.removeEventListener('pointermove', moveDrag);
      if (container) {
        container.removeEventListener('pointerdown', startDrag);
        container.removeEventListener('pointermove', moveDrag);
      }
      window.removeEventListener('pointerup', endDrag);
      if (obj) {
        obj.removeEventListener('pointerdown', startDrag);
        obj.removeEventListener('pointermove', moveDrag);
      }
      panel.removeEventListener('contextmenu', preventMenu);
      panel.removeEventListener('dblclick', onDblClick);
      window.removeEventListener('keydown', onKey);
    };
  }, [pan.x, pan.y, zoom, isSpaceDown]);

  // Aplicar transform (zoom + pan) en el wrapper; fallback a SVG/<object>
  useEffect(() => {
    const el = inlineSvgElRef.current;
    const obj = objectElRef.current;
    const container = svgContainerRef.current;
    const wrapper = zoomWrapperRef.current;
    if (wrapper) {
      try {
        (wrapper.style as any).transformOrigin = '50% 50%';
        (wrapper.style as any).transform = `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`;
        (wrapper.style as any).transition = isDraggingRef.current ? 'transform 80ms linear' : 'transform 200ms ease-in-out';
        (wrapper.style as any).willChange = 'transform';
        (wrapper.style as any).display = 'inline-block';
      } catch (error) {
        console.error('apply zoom/pan transform (wrapper) error', error);
      }
      return;
    }
    // Fallback: si no hay wrapper, aplicar a contenedor/SVG/<object>
    if (container) {
      try {
        (container.style as any).transformOrigin = '50% 50%';
        (container.style as any).transform = `scale(${zoom})`;
        (container.style as any).transition = 'transform 200ms ease-in-out';
        (container.style as any).willChange = 'transform';
      } catch (error) {
        console.error('apply zoom transform (container) error', error);
      }
    }
    if (el) {
      try {
        (el.style as any).transformOrigin = '50% 50%';
        (el.style as any).transform = `scale(${zoom})`;
        (el.style as any).transition = 'transform 200ms ease-in-out';
        (el.style as any).transformBox = 'fill-box';
      } catch (error) {
        console.error('apply zoom transform (inline) error', error);
      }
    }
    if (obj) {
      try {
        (obj.style as any).transformOrigin = '50% 50%';
        (obj.style as any).transform = `scale(${zoom})`;
        (obj.style as any).transition = 'transform 200ms ease-in-out';
        (obj.style as any).display = 'block';
      } catch (error) {
        console.error('apply zoom transform (<object>) error', error);
      }
    }
  }, [zoom, pan]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-[#1a0b2e] via-[#2d1b4e] to-[#4a2c6d] space-y-6 p-4 text-white">
      <header className="space-y-3">
        <div>
          <h1 className="text-4xl md:text-5xl font-black">
            <span className="bg-gradient-to-r from-yellow-400 via-blue-500 to-red-500 bg-clip-text text-transparent">Explora Colombia</span>
          </h1>
          <p className="text-white/80">Haz clic en un departamento y descubre datos curiosos.</p>
          <div className="flex flex-wrap gap-3 mt-3">
            <Card className="bg-gradient-to-br from-yellow-400/80 to-orange-400/80 border-2 border-yellow-600/50 shadow backdrop-blur-sm">
              <CardContent className="p-3 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-white" />
                <div className="text-left">
                  <div className="text-xs font-bold text-white">Puntos</div>
                  <div className="text-xl font-black text-white">{puntos}</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-400/80 to-emerald-400/80 border-2 border-green-600/50 shadow backdrop-blur-sm">
              <CardContent className="p-3 flex items-center gap-2">
                <Star className="w-5 h-5 text-white" />
                <div className="text-left">
                  <div className="text-xs font-bold text-white">Explorados</div>
                  <div className="text-xl font-black text-white">{visitados.length}/{departamentos.length}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Buscar departamento…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="rounded-full px-4 py-2 bg-white/10 text-white placeholder:text-white/70 border border-white/20 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <select
              value={regionFiltro}
              onChange={(e) => setRegionFiltro(e.target.value)}
              className="rounded-full px-4 py-2 bg-white/10 text-white border border-white/20 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              {regiones.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          {seleccion && (
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-white/10 text-white border border-white/20">Región: {seleccion.region}</Badge>
              <Badge className="bg-white/10 text-white border border-white/20">Capital: {seleccion.capital}</Badge>
              {typeof seleccion.poblacionAprox === 'number' && (
                <Badge className="bg-white/10 text-white border border-white/20">Población: {seleccion.poblacionAprox.toLocaleString('es-CO')}</Badge>
              )}
            </div>
          )}
        </div>
      </header>

      <section className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-slate-900/60 backdrop-blur p-4 shadow relative z-0">
        {svgDisponible ? (
          <div className="w-full overflow-hidden" ref={panelRef} style={{ userSelect: 'none', touchAction: 'none' }}>
              <style>
              {`
              .dept-hover { filter: brightness(1.12) saturate(1.05) drop-shadow(0 1px 0 rgba(0,0,0,0.2)); transform: translateY(-1px); transition: transform 150ms ease, filter 150ms ease; }
              .dept-selected { stroke: #10b981 !important; stroke-width: 4 !important; vector-effect: non-scaling-stroke; filter: drop-shadow(0 2px 0 rgba(0,0,0,0.4)) drop-shadow(0 10px 10px rgba(0,0,0,0.28)); transform: translateY(-1px) scale(1.012); transition: filter 150ms ease, transform 150ms ease; }
              .label-selected { fill: #10b981; font-weight: 700; }
              /* Hover directo para formas y textos del SVG */
              path:hover, polygon:hover, polyline:hover { filter: brightness(1.12) saturate(1.05); transform: translateY(-1px); transition: transform 150ms ease, filter 150ms ease; }
              text:hover { fill: #16a34a; font-weight: 700; }
            `}
              </style>
            <div className="absolute left-4 top-4 z-20 flex items-center gap-2 mb-2 pointer-events-none">
              <Button
                className="pointer-events-auto rounded-full px-3 py-2 bg-white/10 text-white hover:bg-white/20 border border-white/20 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                onClick={() => setZoom((z)=>Math.min(3, parseFloat((z + 0.15).toFixed(2))))}
              >+
              </Button>
              <Button
                className="pointer-events-auto rounded-full px-3 py-2 bg-white/10 text-white hover:bg-white/20 border border-white/20 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                onClick={() => setZoom((z)=>Math.max(0.5, parseFloat((z - 0.15).toFixed(2))))}
              >-
              </Button>
              <Button
                className="pointer-events-auto rounded-full px-3 py-2 bg-white/10 text-white hover:bg-white/20 border border-white/20 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                onClick={resetView}
                >Reset</Button>
              <span className="text-xs text-white/80 pointer-events-none">Zoom: {Math.round(zoom*100)}%</span>
              <span className="text-xs text-white/70 pointer-events-none">Arrastra con clic izquierdo • Reset: R o doble clic</span>
            </div>
            <div ref={svgContainerRef} className="relative z-0 w-full min-h-[460px]">
              <div ref={zoomWrapperRef} className="inline-block w-full h-full" />
            </div>
            {!svgLoaded && (
              <div className="text-sm text-white/80 mt-2">Cargando mapa…</div>
            )}
          </div>
        ) : (
          <div className="text-sm text-white/80">
            No se encontró `public/colombia.svg`. Usa la lista de abajo o agrega un SVG con atributos `data-dept`.
          </div>
      )}
      </section>
      {/* Quiz sencillo: capitales y regiones */}
      <section className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-slate-900/60 backdrop-blur p-4 shadow mt-4 relative z-10">
        <h2 className="text-xl font-bold mb-2 text-white">Juego rápido: Capitales y Regiones</h2>
        {!quizActivo ? (
          <div className="flex items-center gap-2">
            <p className="text-white/80">Pon a prueba lo aprendido con preguntas cortas.</p>
            <Button className="rounded-full px-3 py-2 bg-slate-800 text-white hover:bg-slate-700 border border-slate-700 shadow-sm" onClick={iniciarQuiz}>Iniciar Quiz</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {!quizFinalizado ? (
              <div>
                <div className="mb-2 text-sm text-white/70">Pregunta {indicePregunta + 1} de {preguntas.length}</div>
                <Card className="bg-slate-800/70 border border-slate-700 text-white shadow-sm">
                  <CardContent className="p-4">
                    <div className="font-semibold mb-2 text-white">
                      {preguntas[indicePregunta].tipo === "capital"
                        ? `¿Cuál es la capital de ${preguntas[indicePregunta].departamento.nombre}?`
                        : `¿A qué región pertenece ${preguntas[indicePregunta].departamento.nombre}?`}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {preguntas[indicePregunta].opciones.map((op) => (
                        <Button
                          key={op}
                          className={`rounded-lg px-3 py-2 border transition disabled:opacity-60 disabled:cursor-not-allowed ${respuestaSeleccionada === op ?
                            (op === preguntas[indicePregunta].respuestaCorrecta ? "bg-emerald-900/40 border-emerald-600 text-emerald-100 hover:bg-emerald-900/50" : "bg-rose-900/40 border-rose-600 text-rose-100 hover:bg-rose-900/50") :
                            "bg-slate-800 text-white border-slate-700 hover:bg-slate-700"}`}
                          onClick={() => responder(op)}
                          disabled={!!respuestaSeleccionada}
                        >{op}</Button>
                      ))}
                    </div>
                    <div className="mt-3">
                      <Button className="rounded-full px-3 py-2 bg-slate-800 text-white hover:bg-slate-700 border border-slate-700 shadow-sm" onClick={siguientePregunta} disabled={!respuestaSeleccionada}>Siguiente</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="text-white/80">¡Terminaste! Puntaje: {puntaje} / {preguntas.length}</div>
                <Button className="rounded-full px-3 py-2 bg-slate-800 text-white hover:bg-slate-700 border border-slate-700 shadow-sm" onClick={() => { setQuizActivo(false); }}>Cerrar</Button>
                <Button className="rounded-full px-3 py-2 bg-slate-800 text-white hover:bg-slate-700 border border-slate-700 shadow-sm" onClick={() => { generarPreguntas(6); setQuizFinalizado(false); setRespuestaSeleccionada(null); setIndicePregunta(0); setPuntaje(0); }}>Reiniciar</Button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Lista alternativa interactiva (si no hay SVG) */}
      {!svgDisponible && (
        <section className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-white/80 dark:bg-slate-900/60 backdrop-blur p-4 shadow">
          <h2 className="text-lg font-semibold mb-2 text-white">Departamentos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {listaFiltrada.map((d) => (
              <button
                key={d.id}
                onClick={() => setSeleccion(d)}
                className={`text-left rounded-lg px-3 py-2 border transition ${
                  seleccion?.id === d.id
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30"
                    : "border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <div className="font-medium text-white">{d.nombre}</div>
                <div className="text-xs text-white/70">Capital: {d.capital} • Región: {d.region}</div>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-slate-900/60 backdrop-blur p-4 shadow relative z-10">
        <h2 className="text-xl font-bold mb-2 text-white">Detalles del departamento</h2>
        {seleccion ? (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 mb-1">
            <Badge className="bg-white/10 text-white border border-white/20">{seleccion.nombre}</Badge>
            <Badge className="bg-white/10 text-white border border-white/20">Capital: {seleccion.capital}</Badge>
            <Badge className="bg-white/10 text-white border border-white/20">Región: {seleccion.region}</Badge>
              <Button
                className="rounded-full px-3 py-1 bg-emerald-500 text-white hover:bg-emerald-600 border border-emerald-600/50 shadow-sm"
                onClick={() => speakDepartamento(seleccion)}
                title="Leer en voz alta"
              >
                Escuchar 🔊
              </Button>
            </div>
            {typeof seleccion.poblacionAprox === "number" && (
            <div className="text-white/80"><span className="font-medium">Población aprox.:</span> {seleccion.poblacionAprox.toLocaleString("es-CO")}</div>
            )}
            <div className="mt-3">
              <h3 className="font-semibold text-white">Actividades sugeridas</h3>
            <ul className="list-disc pl-5 text-white/80">
                {actividades.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
            <div className="mt-3">
              <h3 className="font-semibold text-white">Datos curiosos</h3>
            <ul className="list-disc pl-5 text-white/80">
                {curiosidadesPorRegion[seleccion.region].map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-white/70">Haz clic en el mapa o en la lista para ver detalles.</div>
        )}
      </section>
    </div>
  );
}