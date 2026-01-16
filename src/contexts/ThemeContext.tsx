import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeType, SystemType, getSystemTheme } from '@/data/mockData';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  setThemeBySystem: (system: SystemType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeType>('neutral');

  useEffect(() => {
    // Remove all theme classes
    document.documentElement.classList.remove('theme-medieval', 'theme-wildwest');
    
    // Add the current theme class
    if (theme === 'medieval') {
      document.documentElement.classList.add('theme-medieval');
    } else if (theme === 'wildwest') {
      document.documentElement.classList.add('theme-wildwest');
    }
  }, [theme]);

  const setThemeBySystem = (system: SystemType) => {
    setTheme(getSystemTheme(system));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, setThemeBySystem }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
