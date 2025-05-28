import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from '../../hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '../../components/auth/AuthHeader';

const ServerError = ({ message }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

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
          textAlign: 'center',
        }}
      >
        <Typography variant="h3" mb={2} color="error.main">500</Typography>
        <Typography variant="h5" mb={2}>{t('errors.serverErrorTitle')}</Typography>
        <Typography variant="body1" mb={3}>{message || t('errors.serverErrorText')}</Typography>
        <Button variant="contained" color="primary" onClick={() => navigate('/')}>{t('errors.backToHome')}</Button>
      </Box>
    </>
  );
};

export default ServerError; 