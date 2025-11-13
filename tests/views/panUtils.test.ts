import { DRAG_THRESHOLD, panFactor, transitionForDragging } from '../../src/views/panUtils';

describe('panUtils', () => {
  test('DRAG_THRESHOLD es 1', () => {
    expect(DRAG_THRESHOLD).toBe(1);
  });

  test('panFactor disminuye como 1/zoom (más preciso con zoom alto)', () => {
    expect(panFactor(1)).toBeCloseTo(1);
    expect(panFactor(2)).toBeCloseTo(0.5);
    expect(panFactor(3)).toBeCloseTo(1/3);
  });

  test('transitionForDragging devuelve linear en arrastre y ease-in-out al no arrastrar', () => {
    expect(transitionForDragging(true)).toContain('linear');
    expect(transitionForDragging(true)).toContain('80ms');
    expect(transitionForDragging(false)).toContain('ease-in-out');
    expect(transitionForDragging(false)).toContain('200ms');
  });
});