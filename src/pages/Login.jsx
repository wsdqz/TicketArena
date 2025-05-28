import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Link,
  Alert,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../hooks/useTranslation';
import AuthHeader from '../components/auth/AuthHeader';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const emailRef = useRef();

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password, formData.rememberMe);
      const from = location.state?.from || '/';
      navigate(from);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AuthHeader />
      <Container maxWidth="sm">
        <Box sx={{ mt: 8, mb: 4 }}>
          <Paper sx={{ p: 4 }}>
            <Typography variant="h4" align="center" gutterBottom>
              {t('auth.login')}
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label={t('auth.email')}
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                margin="normal"
                required
                autoFocus
                ref={emailRef}
              />

              <TextField
                fullWidth
                label={t('auth.password')}
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                margin="normal"
                required
                slotProps={{
                  input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showPassword ? t('auth.hidePassword') || 'Hide password' : t('auth.showPassword') || 'Show password'}
                        onClick={() => setShowPassword((show) => !show)}
                        edge="end"
                        tabIndex={-1}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }
                }}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    color="primary"
                  />
                }
                label={t('auth.rememberMe')}
                sx={{ mt: 1 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{ mt: 2, mb: 2 }}
              >
                {loading ? t('common.loading') : t('auth.login')}
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2">
                  {t('auth.noAccount')}{' '}
                  <Link component={RouterLink} to="/register">
                    {t('auth.register')}
                  </Link>
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <Link component={RouterLink} to="/reset-password">
                    {t('auth.forgotPassword')}
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>
    </>
  );
};

export default Login; 