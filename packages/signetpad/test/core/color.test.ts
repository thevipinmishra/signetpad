import { describe, expect, it } from 'vitest';
import { assertCssColor } from '../../src/color.js';

describe('assertCssColor', () => {
  it('accepts plain CSS colors', () => {
    expect(assertCssColor('#111827', 'color')).toBe('#111827');
    expect(assertCssColor('#abc', 'color')).toBe('#abc');
    expect(assertCssColor('rgb(1, 2, 3)', 'color')).toBe('rgb(1, 2, 3)');
    expect(assertCssColor('rgba(1, 2, 3, 0.5)', 'color')).toBe('rgba(1, 2, 3, 0.5)');
    expect(assertCssColor('hsl(120, 50%, 40%)', 'color')).toBe('hsl(120, 50%, 40%)');
    expect(assertCssColor('black', 'color')).toBe('black');
    expect(assertCssColor('transparent', 'color')).toBe('transparent');
  });

  it('rejects paint servers, markup, and unknown named colors', () => {
    expect(() => assertCssColor('url(#pattern)', 'color')).toThrow('plain CSS color');
    expect(() => assertCssColor('red"><script>', 'color')).toThrow('plain CSS color');
    expect(() => assertCssColor('expression(alert(1))', 'color')).toThrow('plain CSS color');
    expect(() => assertCssColor('notARealColor', 'color')).toThrow('plain CSS color');
    expect(() => assertCssColor('', 'color')).toThrow('cannot be empty');
  });

  it('trims and normalizes accepted colors', () => {
    expect(assertCssColor('  #Abc  ', 'color')).toBe('#Abc');
    expect(assertCssColor('Black', 'color')).toBe('black');
  });
});
