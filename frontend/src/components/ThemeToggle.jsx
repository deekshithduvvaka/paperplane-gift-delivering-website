import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' ||
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm transition-all duration-300 hover:scale-105 active:scale-95"
      aria-label="Toggle theme"
    >
      {darkMode ? (
        <Sun className="h-5 w-5 animate-spin" style={{ animationDuration: '8s' }} />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  );
}
