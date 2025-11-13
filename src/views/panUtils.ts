// Utilidades para pan/zoom y transición durante arrastre
export const DRAG_THRESHOLD = 1;

export function panFactor(zoom: number): number {
  // Mantiene desplazamiento visual constante independientemente del zoom.
  // translate(px) se escala por `scale(zoom)`, por lo que usamos 1/zoom.
  const safeZoom = Math.max(zoom, 0.0001);
  return 1 / safeZoom;
}

export function transitionForDragging(isDragging: boolean): string {
  return isDragging ? 'transform 80ms linear' : 'transform 200ms ease-in-out';
}