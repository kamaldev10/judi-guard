// @vitest-environment node

import { describe, it, expect } from 'vitest';
import { cn } from '../index'; // <-- Sesuaikan path impor Anda

describe('cn utility function', () => {
  // Tes 1: Perilaku dasar seperti clsx
  it('should combine simple strings', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  it('should handle conditional classes in objects', () => {
    expect(cn({ class1: true, class2: false, class3: true })).toBe('class1 class3');
  });

  it('should handle arrays of classes', () => {
    expect(cn(['class1', 'class2'], 'class3')).toBe('class1 class2 class3');
  });

  it('should ignore falsy values', () => {
    expect(cn('class1', null, undefined, false, '', 'class2')).toBe('class1 class2');
  });

  // Tes 2: Perilaku tailwind-merge (resolusi konflik)
  it('should merge conflicting Tailwind classes (last one wins)', () => {
    // p-4 harus menimpa p-2
    expect(cn('p-2', 'p-4')).toBe('p-4');
    // px-4 harus menimpa px-2
    expect(cn('px-2', 'py-3', 'px-4')).toBe('py-3 px-4');
    // text-red-600 menimpa text-red-500
    expect(cn('text-red-500', 'bg-blue-100', 'text-red-600')).toBe('bg-blue-100 text-red-600');
  });

  it('should handle complex merging scenarios', () => {
    expect(cn('p-2', { 'p-4': true }, ['px-6', 'py-1'])).toBe('p-4 px-6 py-1');
  });
});
