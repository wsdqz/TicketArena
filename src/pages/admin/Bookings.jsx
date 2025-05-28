import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Alert,
  CircularProgress,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Pagination
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Visibility as VisibilityIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useTranslation } from '../../hooks/useTranslation';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const AdminBookings = () => {
  const { t, currentLanguage } = useTranslation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [detailsDialog, setDetailsDialog] = useState({
    open: false,
    booking: null
  });
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    bookingId: null,
    action: '' // cancel / confirm
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 10;

  useEffect(() => {
    fetchBookings();
  }, [page]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/admin/bookings?page=${page}&per_page=${perPage}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error(t('errors.loadBookings'));
      const data = await response.json();
      setBookings(data.items || []);
      setTotalPages(data.pages || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openDetailsDialog = (booking) => {
    setDetailsDialog({
      open: true,
      booking
    });
  };

  const closeDetailsDialog = () => {
    setDetailsDialog({
      open: false,
      booking: null
    });
  };

  const openConfirmDialog = (bookingId, action) => {
    const title = action === 'cancel' 
      ? t('bookings.cancelTitle') 
      : t('bookings.confirmTitle');
    
    const message = action === 'cancel' 
      ? t('bookings.cancelConfirm') 
      : t('bookings.confirmBookingAdmin');
    
    setConfirmDialog({
      open: true,
      title,
      message,
      bookingId,
      action
    });
  };

  const handleConfirmDialog = async () => {
    const { bookingId, action } = confirmDialog;
    
    try {
      let endpoint = `http://localhost:5000/api/bookings/${bookingId}`;
      let method = 'PUT';
      let body = {};
      
      if (action === 'cancel') {
        method = 'DELETE';
      } else if (action === 'confirm') {
        body = { status: 'confirmed' };
      }
      
      const response = await fetch(endpoint, {
        method,
        headers: action === 'confirm' ? {
          'Content-Type': 'application/json'
        } : undefined,
        body: action === 'confirm' ? JSON.stringify(body) : undefined,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(action === 'cancel' 
          ? t('errors.cancelBooking') 
          : t('errors.confirmBooking')
        );
      }
      
      // refresh the booking list
      const updatedBooking = await response.json();
      setBookings(bookings.map(booking => 
        booking.id === bookingId ? updatedBooking : booking
      ));
      
      // show success notification
      setSuccess(action === 'cancel' 
        ? t('bookings.cancelSuccess') 
        : t('bookings.confirmSuccess')
      );
    } catch (err) {
      console.error('Error updating booking:', err);
      setError(err.message);
    } finally {
      setConfirmDialog({ ...confirmDialog, open: false });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const translateTicketCategory = (category) => {
    const key = `events.ticketCategories.${category}`;
    const translation = t(key);
    return translation === key ? category : translation;
  };

  const getEventTitle = (booking) => {
    if (!booking.event_title) return '';
    
    return typeof booking.event_title === 'object'
      ? booking.event_title[currentLanguage] || booking.event_title.en || booking.event_title.ru
      : booking.event_title;
  };

  const formatTicketCategories = (seats) => {
    if (!seats || !Array.isArray(seats) || seats.length === 0) return '';
    
    // if all tickets are the same category, return the translated name
    const firstCategory = seats[0];
    if (seats.every(cat => cat === firstCategory)) {
      return translateTicketCategory(firstCategory);
    }
    
    // otherwise, group by categories and count
    const categoryCounts = {};
    seats.forEach(category => {
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    
    return Object.entries(categoryCounts)
      .map(([category, count]) => `${translateTicketCategory(category)} (${count})`)
      .join(', ');
  };

  const handleSuccessClose = () => {
    setSuccess('');
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const filteredBookings = useMemo(() => {
    const searchLower = search.toLowerCase();
    return bookings.filter(booking => {
      // status filtering
      if (statusFilter !== 'all' && booking.status !== statusFilter) return false;
      // search by event title (current language), user name, id, ticket categories
      let eventTitle = '';
      if (booking.event_title) {
        if (typeof booking.event_title === 'object') {
          eventTitle = booking.event_title[currentLanguage]?.toLowerCase() || '';
        } else {
          eventTitle = booking.event_title.toLowerCase();
        }
      }
      const userName = booking.user_name?.toLowerCase() || '';
      const idText = booking.id?.toString() || '';
      const categories = Array.isArray(booking.seats) ? booking.seats.join(' ').toLowerCase() : '';
      return (
        eventTitle.includes(searchLower) ||
        userName.includes(searchLower) ||
        idText.includes(searchLower) ||
        categories.includes(searchLower)
      );
    });
  }, [bookings, search, statusFilter, currentLanguage]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>
        {t('admin.manageBookings')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <TextField
          fullWidth
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t('common.search')}
          margin="normal"
        />
        <FormControl size="small" sx={{ minWidth: '150px' }}>
          <InputLabel id="status-filter-label">{t('common.status')}</InputLabel>
          <Select
            labelId="status-filter-label"
            value={statusFilter}
            label={t('common.status')}
            onChange={(e) => setStatusFilter(e.target.value)}
            startAdornment={
              <InputAdornment position="start">
                <FilterIcon />
              </InputAdornment>
            }
          >
            <MenuItem value="all">{t('common.all')}</MenuItem>
            <MenuItem value="pending">{t('bookings.status.pending')}</MenuItem>
            <MenuItem value="confirmed">{t('bookings.status.confirmed')}</MenuItem>
            <MenuItem value="cancelled">{t('bookings.status.cancelled')}</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {filteredBookings.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6">
            {t('bookings.noBookings')}
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>{t('auth.name')}</TableCell>
                <TableCell>{t('events.eventName')}</TableCell>
                <TableCell>{t('bookings.bookingDate')}</TableCell>
                <TableCell>{t('events.ticketCategory')}</TableCell>
                <TableCell>{t('events.ticketCount')}</TableCell>
                <TableCell>{t('events.totalPrice')}</TableCell>
                <TableCell>{t('common.status')}</TableCell>
                <TableCell>{t('common.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>{booking.id}</TableCell>
                  <TableCell>{booking.user_name}</TableCell>
                  <TableCell>{getEventTitle(booking)}</TableCell>
                  <TableCell>
                    {booking.created_at ? new Date(booking.created_at).toLocaleString() : ''}
                  </TableCell>
                  <TableCell>
                    {booking.seats && booking.seats.length > 0 
                      ? formatTicketCategories(booking.seats)
                      : ''}
                  </TableCell>
                  <TableCell>{booking.seats ? booking.seats.length : 0}</TableCell>
                  <TableCell>{booking.total_price} ₸</TableCell>
                  <TableCell>
                    <Chip
                      label={t(`bookings.status.${booking.status}`)}
                      color={getStatusColor(booking.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton 
                        size="small" 
                        color="info" 
                        onClick={() => openDetailsDialog(booking)}
                        title={t('common.view')}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      {booking.status === 'pending' && (
                        <>
                          <IconButton 
                            size="small" 
                            color="success" 
                            onClick={() => openConfirmDialog(booking.id, 'confirm')}
                            title={t('common.confirm')}
                          >
                            <CheckCircleIcon fontSize="small" />
                          </IconButton>
                        </>
                      )}
                      {(booking.status === 'pending' || booking.status === 'confirmed') && (
                        <IconButton 
                          size="small" 
                          color="error" 
                          onClick={() => openConfirmDialog(booking.id, 'cancel')}
                          title={t('common.cancel')}
                        >
                          <CancelIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* pagination */}
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

      {/* dialog with booking details */}
      <Dialog open={detailsDialog.open} onClose={closeDetailsDialog} maxWidth="md" fullWidth>
        <DialogTitle>{t('bookings.bookingDetails')}</DialogTitle>
        <DialogContent>
          {detailsDialog.booking && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('events.eventName')}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {getEventTitle(detailsDialog.booking)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('auth.name')}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {detailsDialog.booking.user_name}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('bookings.bookingDate')}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {detailsDialog.booking.created_at 
                    ? new Date(detailsDialog.booking.created_at).toLocaleString() 
                    : ''}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('common.status')}
                </Typography>
                <Chip
                  label={t(`bookings.status.${detailsDialog.booking.status}`)}
                  color={getStatusColor(detailsDialog.booking.status)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('events.ticketCategory')}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {detailsDialog.booking.seats && (() => {
                    // group tickets by categories and count
                    const categoryCounts = {};
                    detailsDialog.booking.seats.forEach(category => {
                      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
                    });
                    
                    // show only unique categories with count
                    return Object.entries(categoryCounts).map(([category, count]) => (
                      <Chip 
                        key={category} 
                        label={`${translateTicketCategory(category)} (${count})`} 
                        size="small" 
                        color="primary"
                        variant="outlined" 
                      />
                    ));
                  })()}
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('events.totalPrice')}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {detailsDialog.booking.total_price} ₸
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDetailsDialog}>
            {t('common.close')}
          </Button>
          {detailsDialog.booking && detailsDialog.booking.status === 'pending' && (
            <>
              <Button 
                color="success" 
                variant="contained"
                onClick={() => {
                  closeDetailsDialog();
                  openConfirmDialog(detailsDialog.booking.id, 'confirm');
                }}
              >
                {t('common.confirm')}
              </Button>
              <Button 
                color="error" 
                variant="contained"
                onClick={() => {
                  closeDetailsDialog();
                  openConfirmDialog(detailsDialog.booking.id, 'cancel');
                }}
              >
                {t('common.cancel')}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* dialog with confirmation action */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={handleConfirmDialog}
        onCancel={() => setConfirmDialog({ ...confirmDialog, open: false })}
        confirmText={confirmDialog.action === 'cancel' ? t('common.cancel') : t('common.confirm')}
        cancelText={t('common.close')}
      />
    </Box>
  );
};

export default AdminBookings; 