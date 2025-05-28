import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const ThemeContext = createContext();

export const useThemeMode = () => useContext(ThemeContext);

const getInitialMode = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') return saved;
    // default - system theme
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  }
  return 'light';
};

export const CustomThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(getInitialMode);

  useEffect(() => {
    localStorage.setItem('theme', mode);
    document.body.setAttribute('data-theme', mode);
  }, [mode]);

  const toggleTheme = () => setMode((prev) => (prev === 'light' ? 'dark' : 'light'));

  const theme = useMemo(() =>
    createTheme({
      palette: {
        mode,
        ...(mode === 'dark'
          ? {
              background: {
                default: '#1a1a1a',
                paper: '#23272f',
              },
              primary: { main: '#3498db' },
              secondary: { main: '#2980b9' },
              text: { primary: '#ecf0f1', secondary: '#b0b0b0' },
            }
          : {
              background: {
                default: '#ecf0f1',
                paper: '#fff',
              },
              primary: { main: '#2c3e50' },
              secondary: { main: '#34495e' },
              text: { primary: '#333', secondary: '#555' },
            }),
      },
      shape: { borderRadius: 8 },
      typography: {
        fontFamily: [
          'Roboto',
          'Arial',
          'sans-serif',
        ].join(','),
      },
    }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
}; 