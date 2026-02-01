import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeType = 'neutral' | 'medieval' | 'wildwest' | 'cosmic';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  setThemeBySystem: (system: string) => void;
  resetToNeutral: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Map system to theme
const getSystemTheme = (system: string): ThemeType => {
  switch (system) {
    case '5e':
      return 'medieval';
    case 'autoral':
    case 'olho_da_morte':
      return 'wildwest';
    case 'horror':
      return 'cosmic';
    default:
      return 'neutral';
  }
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeType>('neutral');

  useEffect(() => {
    // Remove all theme classes
    document.documentElement.classList.remove('theme-medieval', 'theme-wildwest', 'theme-cosmic');
    
    // Add the current theme class
    if (theme === 'medieval') {
      document.documentElement.classList.add('theme-medieval');
    } else if (theme === 'wildwest') {
      document.documentElement.classList.add('theme-wildwest');
    } else if (theme === 'cosmic') {
      document.documentElement.classList.add('theme-cosmic');
    }
  }, [theme]);

  const setThemeBySystem = (system: string) => {
    setTheme(getSystemTheme(system));
  };

  const resetToNeutral = () => {
    setTheme('neutral');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, setThemeBySystem, resetToNeutral }}>
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
