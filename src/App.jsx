import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';
import AppRoutes from './routes';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { CustomThemeProvider } from './contexts/ThemeContext';

const App = () => {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <CustomThemeProvider>
            <CssBaseline />
            <LocalizationProvider
              dateAdapter={AdapterDateFns}
              adapterLocale={ru}
            >
              <AppRoutes />
            </LocalizationProvider>
          </CustomThemeProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
};

export default App; 