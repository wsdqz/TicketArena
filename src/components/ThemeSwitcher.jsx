import React from 'react';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useThemeMode } from '../contexts/ThemeContext';
import { useTranslation } from '../hooks/useTranslation';

const ThemeSwitcher = () => {
  const { mode, toggleTheme } = useThemeMode();
  const { t } = useTranslation();

  return (
    <Tooltip title={mode === 'dark' ? t('theme.light') : t('theme.dark')}>
      <IconButton color="inherit" onClick={toggleTheme} size="large">
        {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeSwitcher; 