import React from 'react';
import { AppBar, Toolbar, Box, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import LanguageSwitcher from '../LanguageSwitcher';
import ThemeSwitcher from '../ThemeSwitcher';

const AuthHeader = () => {
  return (
    <AppBar position="static" color="transparent" elevation={0}>
      <Toolbar>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit'
          }}
        >
          TicketArena
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <LanguageSwitcher />
          <ThemeSwitcher />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AuthHeader; 