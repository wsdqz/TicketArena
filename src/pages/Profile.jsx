import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Avatar,
  Grid,
  Alert,
  IconButton,
  Collapse
} from '@mui/material';
import { PhotoCamera as PhotoCameraIcon } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../hooks/useTranslation';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { t } = useTranslation();
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [avatar, setAvatar] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      // create temporary URL for preview
      const previewUrl = URL.createObjectURL(file);
      // update local user state with temporary URL avatar
      updateUser({
        ...user,
        avatar_url: previewUrl
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // check passwords
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error(t('validation.passwordMatch'));
        }
        if (!formData.currentPassword) {
          throw new Error(t('validation.required'));
        }
      }

      let requestData;
      let headers = {};

      if (avatar) {
        // if there is a file, use FormData
        requestData = new FormData();
        requestData.append('name', formData.name);
        requestData.append('email', formData.email);
        if (formData.currentPassword) {
          requestData.append('currentPassword', formData.currentPassword);
          requestData.append('newPassword', formData.newPassword);
        }
        requestData.append('avatar', avatar);
      } else {
        // if there is no file, send JSON
        headers = {
          'Content-Type': 'application/json',
        };
        requestData = JSON.stringify({
          name: formData.name,
          email: formData.email,
          ...(formData.currentPassword && {
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword
          })
        });
      }

      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers,
        body: requestData,
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || t('errors.updateError'));
      }

      const updatedUser = await response.json();
      
      // update local user state
      updateUser({
        ...user,
        ...updatedUser,
        avatar_url: updatedUser.avatar_url || user.avatar_url
      });

      setSuccess(t('profile.updateSuccess'));
      setAvatar(null);

      // clear password fields only if update is successful
      if (formData.currentPassword) {
        setFormData({
          ...formData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setShowPasswordChange(false);
      }
    } catch (err) {
      console.error('Profile update error:', err);
      if (err.message === 'Failed to fetch') {
        setError(t('errors.networkError'));
      } else {
        setError(err.message || t('errors.updateError'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        {t('profile.title')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid columns={{ xs: 12 }} display="flex" justifyContent="center">
              <Box position="relative">
                <Avatar
                  src={user?.avatar_url}
                  sx={{ 
                    width: 100, 
                    height: 100,
                    cursor: 'pointer'
                  }}
                />
                <input
                  accept="image/*"
                  type="file"
                  id="avatar-input"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
                <label htmlFor="avatar-input">
                  <IconButton
                    color="primary"
                    component="span"
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      backgroundColor: 'background.paper',
                      '&:hover': {
                        backgroundColor: 'primary.light'
                      }
                    }}
                  >
                    <PhotoCameraIcon />
                  </IconButton>
                </label>
              </Box>
            </Grid>

            <Grid columns={{ xs: 12 }}>
              <TextField
                fullWidth
                label={t('auth.name')}
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid columns={{ xs: 12 }}>
              <TextField
                fullWidth
                label={t('auth.email')}
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid columns={{ xs: 12 }}>
              <Button
                color="primary"
                onClick={() => setShowPasswordChange(!showPasswordChange)}
                sx={{ mb: 2 }}
              >
                {t('profile.changePassword')}
              </Button>
            </Grid>

            <Collapse in={showPasswordChange} timeout="auto" unmountOnExit>
              <Grid container spacing={3}>
                <Grid columns={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label={t('profile.currentPassword')}
                    name="currentPassword"
                    type="password"
                    value={formData.currentPassword}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid columns={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label={t('profile.newPassword')}
                    name="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid columns={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label={t('profile.confirmNewPassword')}
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </Grid>
              </Grid>
            </Collapse>

            <Grid columns={{ xs: 12 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                fullWidth
              >
                {loading ? t('common.loading') : t('common.save')}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile;