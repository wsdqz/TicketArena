import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  Snackbar,
  IconButton,
  Box,
  TextField
} from '@mui/material';
import { useTranslation } from '../hooks/useTranslation';
import ConfirmDialog from '../components/common/ConfirmDialog';
import {
  ShoppingCart as ShoppingCartIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import Pagination from '@mui/material/Pagination';

const Bookings = () => {
  const { t, currentLanguage } = useTranslation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    bookingId: null
  });
  const [payDialog, setPayDialog] = useState({
    open: false,
    bookingId: null
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 10;
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchBookings();
  }, [page]);

  const fetchBookings = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/bookings?page=${page}&per_page=${perPage}`, {
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

  const openCancelDialog = (bookingId) => {
    setConfirmDialog({
      open: true,
      title: t('bookings.cancelTitle'),
      message: t('bookings.cancelConfirm'),
      bookingId
    });
  };

  const openPayDialog = (bookingId) => {
    setPayDialog({ open: true, bookingId });
  };

  const handlePay = async (bookingId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'confirmed' }),
        credentials: 'include'
      });
      if (!response.ok) throw new Error(t('errors.confirmBooking'));
      setBookings(bookings.map(booking =>
        booking.id === bookingId
          ? { ...booking, status: 'confirmed' }
          : booking
      ));
      setSuccess(t('bookings.confirmSuccess'));
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePayConfirm = () => {
    if (payDialog.bookingId) {
      handlePay(payDialog.bookingId);
    }
    setPayDialog({ open: false, bookingId: null });
  };

  const handleCancel = async (bookingId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) throw new Error(t('errors.cancelBooking'));
      
      // get server response
      try {
        const updatedBooking = await response.json();
        console.log('Server response:', updatedBooking);
        
        // update bookings list with server data
        setBookings(bookings.map(booking => 
          booking.id === bookingId 
            ? { 
                ...booking, 
                status: updatedBooking.status || 'cancelled',
                // save other fields from server response if they exist
                ...(updatedBooking.total_price && { total_price: updatedBooking.total_price }),
                ...(updatedBooking.seats && { seats: updatedBooking.seats })
              } 
            : booking
        ));
      } catch (jsonError) {
        console.error('Error parsing JSON:', jsonError);
        // if JSON parsing failed, update status locally
        setBookings(bookings.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'cancelled' } 
            : booking
        ));
      }
      
      // show success notification
      setSuccess(t('bookings.cancelSuccess'));
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError(err.message);
    } finally {
      setConfirmDialog({ ...confirmDialog, open: false });
    }
  };

  const handleSuccessClose = () => {
    setSuccess('');
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

  // function to translate ticket category
  const translateTicketCategory = (category) => {
    const key = `events.ticketCategories.${category}`;
    const translation = t(key);
    return translation === key ? category : translation;
  };

  // function to format ticket categories
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

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // search by bookings through useMemo
  const filteredBookings = useMemo(() => {
    const searchLower = search.toLowerCase();
    return bookings.filter(booking => {
      // search by event title (current language), id, ticket categories
      let eventTitle = '';
      if (booking.event_title) {
        if (typeof booking.event_title === 'object') {
          eventTitle = booking.event_title[currentLanguage]?.toLowerCase() || '';
        } else {
          eventTitle = booking.event_title.toLowerCase();
        }
      }
      const idText = booking.id?.toString() || '';
      const categories = Array.isArray(booking.seats) ? booking.seats.join(' ').toLowerCase() : '';
      return (
        eventTitle.includes(searchLower) ||
        idText.includes(searchLower) ||
        categories.includes(searchLower)
      );
    });
  }, [bookings, search, currentLanguage]);

  if (loading) return <Typography>{t('common.loading')}</Typography>;

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        {t('bookings.title')}
      </Typography>

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
        margin="normal"
      />

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
                  <TableCell>
                    {booking.event_title && 
                      (typeof booking.event_title === 'object' ? 
                        booking.event_title[currentLanguage] || booking.event_title.en || booking.event_title.ru : 
                        booking.event_title)
                    }
                  </TableCell>
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
                    {booking.status !== 'cancelled' && (
                      <>
                        {booking.status === 'pending' && (
                          <IconButton
                            color="success"
                            size="small"
                            onClick={() => openPayDialog(booking.id)}
                            title={t('common.pay')}
                          >
                            <ShoppingCartIcon />
                          </IconButton>
                        )}
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => openCancelDialog(booking.id)}
                          title={t('common.cancel')}
                        >
                          <CancelIcon />
                        </IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

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

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={() => handleCancel(confirmDialog.bookingId)}
        onCancel={() => setConfirmDialog({ ...confirmDialog, open: false })}
        confirmText={t('common.confirm')}
        cancelText={t('common.cancel')}
      />

      <ConfirmDialog
        open={payDialog.open}
        title={t('bookings.confirmTitle')}
        message={t('bookings.confirmBooking') || 'Вы уверены, что хотите купить?'}
        onConfirm={handlePayConfirm}
        onCancel={() => setPayDialog({ open: false, bookingId: null })}
        confirmText={t('common.confirm')}
        cancelText={t('common.cancel')}
      />

      <Snackbar 
        open={!!success} 
        autoHideDuration={6000} 
        onClose={handleSuccessClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSuccessClose} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Bookings; 