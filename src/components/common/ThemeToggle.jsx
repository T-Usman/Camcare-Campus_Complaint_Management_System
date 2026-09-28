import React from 'react';
import { useApp } from '../../context/AppContext';

export function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useApp();

  return (
    <div className={`theme-switch-pill ${className}`} role="group" aria-label="Color theme switcher">
      <button
        type="button"
        id="theme-btn-light"
        className={`theme-switch-btn ${theme === 'light' ? 'active' : ''}`}
        onClick={() => toggleTheme('light')}
        aria-pressed={theme === 'light'}
      >
        Light
      </button>
      <button
        type="button"
        id="theme-btn-dark"
        className={`theme-switch-btn ${theme === 'dark' ? 'active' : ''}`}
        onClick={() => toggleTheme('dark')}
        aria-pressed={theme === 'dark'}
      >
        Dark
      </button>
    </div>
  );
}

export default ThemeToggle;
