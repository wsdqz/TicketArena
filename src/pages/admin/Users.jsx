import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Alert,
  MenuItem,
  Pagination
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useTranslation } from '../../hooks/useTranslation';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const roles = ['user', 'admin'];

const Users = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user'
  });
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 10;

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users?page=${page}&per_page=${perPage}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error(t('errors.loadUsers'));
      const data = await response.json();
      setUsers(data.items || []);
      setTotalPages(data.pages || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = `http://localhost:5000/api/admin/users/${selectedUser.id}`;
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error && errorData.error.startsWith('errors.')) {
          throw new Error(t(errorData.error));
        } else {
          throw new Error(errorData.error || t('errors.saveUser'));
        }
      }

      handleCloseDialog();
      fetchUsers();
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setConfirmDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error && errorData.error.startsWith('errors.')) {
          throw new Error(t(errorData.error));
        } else {
          throw new Error(errorData.error || t('errors.deleteUser'));
        }
      }

      setConfirmDialogOpen(false);
      setUserToDelete(null);
      setError('');
      fetchUsers();
    } catch (err) {
      setError(err.message);
      setConfirmDialogOpen(false);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDialogOpen(false);
    setUserToDelete(null);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const filteredUsers = useMemo(
    () => users.filter(user => user.name.toLowerCase().includes(search.toLowerCase())),
    [users, search]
  );

  if (loading) return <Typography>{t('common.loading')}</Typography>;

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4">{t('admin.manageUsers')}</Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder={t('common.search')}
        margin="dense"
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('auth.name')}</TableCell>
              <TableCell>{t('auth.email')}</TableCell>
              <TableCell>{t('admin.role')}</TableCell>
              <TableCell>{t('common.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{t(`admin.roles.${user.role}`)}</TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenDialog(user)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteClick(user)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {t('admin.editUser')}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label={t('auth.name')}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label={t('auth.email')}
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              select
              label={t('admin.role')}
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              margin="normal"
              required
            >
              {roles.map((role) => (
                <MenuItem key={role} value={role}>
                  {t(`admin.roles.${role}`)}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t('common.cancel')}</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog 
        open={confirmDialogOpen}
        title={t('admin.deleteUser')}
        message={t('admin.deleteUserConfirmation')}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </Container>
  );
};

export default Users; 