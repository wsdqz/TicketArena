import React from 'react';
import { Outlet, Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Container
} from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../hooks/useTranslation';
import LanguageSwitcher from '../components/LanguageSwitcher';
import ThemeSwitcher from '../components/ThemeSwitcher';

const MainLayout = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    handleClose();
    navigate('/');
  };

  const handleProfile = () => {
    handleClose();
    navigate('/profile');
  };

  const handleAdmin = () => {
    handleClose();
    navigate('/admin');
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };
  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
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

          {/* Desktop navigation */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
            <Button color="inherit" component={RouterLink} to="/">
              {t('events.title')}
            </Button>
            {isAuthenticated ? (
              <>
                <Button color="inherit" component={RouterLink} to="/bookings">
                  {t('bookings.title')}
                </Button>
                <IconButton size="large" onClick={handleMenu} color="inherit">
                  <AccountCircle />
                </IconButton>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                  <MenuItem onClick={handleProfile}>{t('profile.title')}</MenuItem>
                  {user?.role === 'admin' && (
                    <MenuItem onClick={handleAdmin}>{t('admin.dashboard')}</MenuItem>
                  )}
                  <MenuItem onClick={handleLogout}>{t('auth.logout')}</MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button color="inherit" component={RouterLink} to="/login">
                  {t('auth.login')}
                </Button>
                <Button color="inherit" component={RouterLink} to="/register">
                  {t('auth.register')}
                </Button>
              </>
            )}
            <LanguageSwitcher />
            <ThemeSwitcher />
          </Box>

          {/* Mobile navigation */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1 }}>
            <LanguageSwitcher />
            <ThemeSwitcher />
            <IconButton color="inherit" onClick={handleMobileMenuOpen} sx={{ ml: 1 }}>
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={mobileMenuAnchor}
              open={Boolean(mobileMenuAnchor)}
              onClose={handleMobileMenuClose}
            >
              <MenuItem component={RouterLink} to="/" onClick={handleMobileMenuClose}>
                {t('events.title')}
              </MenuItem>
              {isAuthenticated
                ? [
                    <MenuItem component={RouterLink} to="/bookings" onClick={handleMobileMenuClose} key="bookings">
                      {t('bookings.title')}
                    </MenuItem>,
                    <MenuItem onClick={() => { handleProfile(); handleMobileMenuClose(); }} key="profile">
                      {t('profile.title')}
                    </MenuItem>,
                    user?.role === 'admin' && (
                      <MenuItem onClick={() => { handleAdmin(); handleMobileMenuClose(); }} key="admin">
                        {t('admin.dashboard')}
                      </MenuItem>
                    ),
                    <MenuItem onClick={() => { handleLogout(); handleMobileMenuClose(); }} key="logout">
                      {t('auth.logout')}
                    </MenuItem>
                  ].filter(Boolean)
                : [
                    <MenuItem component={RouterLink} to="/login" onClick={handleMobileMenuClose} key="login">
                      {t('auth.login')}
                    </MenuItem>,
                    <MenuItem component={RouterLink} to="/register" onClick={handleMobileMenuClose} key="register">
                      {t('auth.register')}
                    </MenuItem>
                  ]
              }
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, py: 3 }}>
        <Outlet />
      </Box>

      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[200]
              : theme.palette.grey[800],
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} TicketArena. {t('common.allRightsReserved')}
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default MainLayout;