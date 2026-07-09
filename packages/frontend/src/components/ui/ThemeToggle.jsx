import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';

const ThemeToggle = ({ className = '' }) => {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      data-testid="theme-toggle-button"
      aria-label={isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
      title={isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
      className={`inline-flex items-center justify-center h-9 w-9 rounded-full border border-black/10 dark:border-white/15 bg-white/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 dark:focus-visible:ring-offset-slate-900 transition-colors duration-150 ${className}`}
    >
      {isDark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
      <span className="sr-only">{isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}</span>
    </button>
  );
};

export default ThemeToggle;
