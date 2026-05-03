import React, { createContext, useContext, useMemo, useState } from 'react';

type ThemeMode = 'light' | 'dark';

type ThemeColors = {
  background: string;
  card: string;
  text: string;
  subText: string;
  primary: string;
  hero: string;
  border: string;
  tabActive: string;
  tabInactive: string;
  danger: string;
};

type ThemeContextType = {
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
};

const lightColors: ThemeColors = {
  background: '#f4f7fb',
  card: '#ffffff',
  text: '#111827',
  subText: '#6b7280',
  primary: '#1e3a8a',
  hero: '#1e3a8a',
  border: '#d1d5db',
  tabActive: '#1e3a8a',
  tabInactive: '#6b7280',
  danger: '#ef4444',
};

const darkColors: ThemeColors = {
  background: '#0f172a',
  card: '#1e293b',
  text: '#f8fafc',
  subText: '#cbd5e1',
  primary: '#60a5fa',
  hero: '#172554',
  border: '#334155',
  tabActive: '#60a5fa',
  tabInactive: '#94a3b8',
  danger: '#dc2626',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('light');
  const toggleTheme = () => setMode((prev) => (prev === 'light' ? 'dark' : 'light'));

  const value = useMemo(
    () => ({
      mode,
      isDark: mode === 'dark',
      colors: mode === 'dark' ? darkColors : lightColors,
      toggleTheme,
    }),
    [mode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used inside ThemeProvider');
  }
  return context;
}
