import { DRAG_THRESHOLD, panFactor, transitionForDragging } from './panUtils';

describe('panUtils', () => {
  test('DRAG_THRESHOLD es 1', () => {
    expect(DRAG_THRESHOLD).toBe(1);
  });

  test('panFactor escala como 20 * zoom^2', () => {
    expect(panFactor(1)).toBe(20);
    expect(panFactor(2)).toBe(80);
    expect(panFactor(3)).toBe(180);
  });

  test('transitionForDragging devuelve linear en arrastre y ease-in-out al no arrastrar', () => {
    expect(transitionForDragging(true)).toContain('linear');
    expect(transitionForDragging(true)).toContain('80ms');
    expect(transitionForDragging(false)).toContain('ease-in-out');
    expect(transitionForDragging(false)).toContain('200ms');
  });
});