import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { Box, Button, TextField, Typography, Alert } from '@mui/material';
import AuthHeader from './AuthHeader';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from '../../hooks/useTranslation';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';

const CodeInputContainer = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-bottom: 16px;
`;
const CodeInput = styled.input`
  width: 40px;
  height: 48px;
  font-size: 2rem;
  text-align: center;
  border: 1px solid #ccc;
  border-radius: 6px;
  outline: none;
  &:focus {
    border-color: #1976d2;
  }
`;

const ResetPassword = () => {
  const theme = useTheme();
  const { t, currentLanguage } = useTranslation();
  const [step, setStep] = useState('request'); // request / reset / setPassword / success
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const codeRefs = useRef([]);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!email) {
      setError('Please enter your email');
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/auth/reset-password-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (!res.ok) throw new Error('Failed to request reset');
      setStep('reset');
    } catch (err) {
      setError('Failed to request password reset');
    }
  };

  const handleCodeChange = (idx, val) => {
    if (!/^[0-9]?$/.test(val)) return;
    const newCode = [...code];
    newCode[idx] = val;
    setCode(newCode);
    if (val && idx < 5) {
      codeRefs.current[idx + 1]?.focus();
    }
    if (!val && idx > 0) {
      codeRefs.current[idx - 1]?.focus();
    }
  };

  const handleCodePaste = (e) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (paste.length === 6) {
      setCode(paste.split(''));
      codeRefs.current[5]?.focus();
    }
  };

  const handleCheckCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const codeStr = code.join('');
    if (codeStr.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }
    // check code through backend (but do not send password)
    try {
      const res = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: codeStr, password: 'password' }) // password is required, but not used
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Invalid code');
        return;
      }
      setStep('setPassword');
    } catch (err) {
      setError('Failed to check code');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    const codeStr = code.join('');
    try {
      const res = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: codeStr, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');
      setSuccess('Password successfully reset!');
      setStep('success');
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    }
  };

  return (
    <>
      <AuthHeader />
      <Box
        maxWidth={400}
        mx="auto"
        mt={8}
        p={3}
        boxShadow={2}
        borderRadius={2}
        bgcolor={theme.palette.background.paper}
        sx={{
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          transition: 'background 0.3s, color 0.3s',
        }}
      >
        <Typography variant="h5" align="center" mb={2}>
          {t('reset.title')}
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        {step === 'request' && (
          <form onSubmit={handleRequestReset}>
            <TextField
              label={t('auth.email')}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              fullWidth
              required
              margin="normal"
              autoFocus
              slotProps={{
                input: {
                  sx: {
                    background: theme.palette.background.default,
                    color: theme.palette.text.primary,
                  }
                }
              }}
            />
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
              {t('reset.sendCode')}
            </Button>
          </form>
        )}
        {step === 'reset' && (
          <form onSubmit={handleCheckCode}>
            <Typography align="center" mb={1}>
              {t('reset.enterCode')}
            </Typography>
            <CodeInputContainer onPaste={handleCodePaste}>
              {code.map((digit, idx) => (
                <CodeInput
                  key={idx}
                  type="text"
                  maxLength={1}
                  value={digit}
                  ref={el => codeRefs.current[idx] = el}
                  onChange={e => handleCodeChange(idx, e.target.value)}
                  onFocus={e => e.target.select()}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  style={{
                    background: theme.palette.background.default,
                    color: theme.palette.text.primary,
                    borderColor: theme.palette.divider,
                  }}
                />
              ))}
            </CodeInputContainer>
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
              {t('reset.verifyCode')}
            </Button>
          </form>
        )}
        {step === 'setPassword' && (
          <form onSubmit={handleResetPassword}>
            <TextField
              label={t('auth.password')}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              fullWidth
              required
              margin="normal"
              InputProps={{
                sx: {
                  background: theme.palette.background.default,
                  color: theme.palette.text.primary,
                },
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
            />
            <TextField
              label={t('auth.confirmPassword')}
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              fullWidth
              required
              margin="normal"
              InputProps={{
                sx: {
                  background: theme.palette.background.default,
                  color: theme.palette.text.primary,
                },
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
            />
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
              {t('reset.resetPassword')}
            </Button>
          </form>
        )}
        {step === 'success' && (
          <>
            <Typography align="center" color="success.main" mt={2}>
              {t('reset.success')}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 3 }}
              onClick={() => window.location.href = '/login'}
            >
              {t('reset.backToLogin')}
            </Button>
          </>
        )}
      </Box>
    </>
  );
};

export default ResetPassword;