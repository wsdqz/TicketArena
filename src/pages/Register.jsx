import React, { useState, useReducer } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Link,
  Alert,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../hooks/useTranslation';
import AuthHeader from '../components/auth/AuthHeader';

const initialState = { name: '', email: '', password: '', confirmPassword: '' };
function reducer(state, action) {
  switch (action.type) {
    case 'field':
      return { ...state, [action.field]: action.value };
    case 'reset':
      return initialState;
    default:
      return state;
  }
}

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { t } = useTranslation();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    dispatch({ type: 'field', field: e.target.name, value: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (state.password !== state.confirmPassword) {
      setError(t('validation.passwordMatch'));
      return;
    }

    if (state.password.length < 6) {
      setError(t('validation.passwordLength'));
      return;
    }

    setLoading(true);

    try {
      await register(state.name, state.email, state.password);
      navigate('/');
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
              {t('auth.register')}
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label={t('auth.name')}
                name="name"
                value={state.name}
                onChange={handleChange}
                margin="normal"
                required
                autoFocus
              />

              <TextField
                fullWidth
                label={t('auth.email')}
                name="email"
                type="email"
                value={state.email}
                onChange={handleChange}
                margin="normal"
                required
              />

              <TextField
                fullWidth
                label={t('auth.password')}
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={state.password}
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
                }}
              }
              />

              <TextField
                fullWidth
                label={t('auth.confirmPassword')}
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={state.confirmPassword}
                onChange={handleChange}
                margin="normal"
                required
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                        aria-label={showConfirmPassword ? t('auth.hidePassword') || 'Hide password' : t('auth.showPassword') || 'Show password'}
                        onClick={() => setShowConfirmPassword((show) => !show)}
                        edge="end"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              }
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{ mt: 3, mb: 2 }}
              >
                {loading ? t('common.loading') : t('auth.register')}
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2">
                  {t('auth.haveAccount')}{' '}
                  <Link component={RouterLink} to="/login">
                    {t('auth.login')}
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

export default Register; 