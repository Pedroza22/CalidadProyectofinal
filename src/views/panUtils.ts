// Utilidades para pan/zoom y transición durante arrastre
export const DRAG_THRESHOLD = 1;

export function panFactor(zoom: number): number {
  return 20 * (zoom * zoom);
}

export function transitionForDragging(isDragging: boolean): string {
  return isDragging ? 'transform 80ms linear' : 'transform 200ms ease-in-out';
}