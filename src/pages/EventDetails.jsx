import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../hooks/useTranslation';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t, currentLanguage } = useTranslation();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/events/${id}`);
      if (!response.ok) throw new Error(t('errors.loadEvent'));
      const data = await response.json();
      console.log('Event data:', data);
      console.log('Venue data:', data.venue);
      setEvent(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/events/${id}` } });
      return;
    }

    try {
      const seats = Array(quantity).fill(selectedTicket.category);
      
      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_id: parseInt(id),
          seats: seats,
          total_price: selectedTicket.price * quantity
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t('errors.booking'));
      }

      navigate('/bookings');
    } catch (err) {
      console.error('Booking error:', err);
      setError(err.message);
    }
  };

  const handleOpenDialog = (ticket) => {
    setSelectedTicket(ticket);
    setQuantity(1);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTicket(null);
    setQuantity(1);
  };

  const truncateDescription = (text, maxLength = 150) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return isDescriptionExpanded ? text : `${text.substring(0, maxLength)}...`;
  };

  if (loading) return <Typography>{t('common.loading')}</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!event) return <Typography>{t('events.notFound')}</Typography>;

  return (
    <Box sx={{
      p: { xs: 2, sm: 4 },
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      boxSizing: 'border-box',
    }}>
      <Grid 
        container 
        spacing={4}
        columns={12}
        sx={{
          justifyContent: 'center',
        }}
      >
        <Grid 
          gridColumn="span 12"
          sx={{
            display: 'flex',
            justifyContent: 'center',
            '@media (min-width:600px)': { gridColumn: 'span 8' },
            '@media (min-width:900px)': { gridColumn: 'span 5' },
            '@media (min-width:1200px)': { gridColumn: 'span 4' },
          }}
        >
          <Box
            component="img"
            src={event.image_url || '/placeholder.jpg'}
            alt={event.title[currentLanguage]}
            sx={{
              width: '100%',
              height: { xs: '400px', md: '600px' },
              objectFit: 'cover',
              display: 'block',
              borderRadius: 3,
              boxShadow: 3,
              position: 'sticky',
              top: 24,
              maxWidth: { xs: '100%', sm: '500px' }
            }}
          />
        </Grid>

        <Grid 
          gridColumn="span 12"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: { xs: 'center', md: 'stretch' },
            '@media (min-width:600px)': { gridColumn: 'span 8' },
            '@media (min-width:900px)': { gridColumn: 'span 7' },
            '@media (min-width:1200px)': { gridColumn: 'span 8' },
          }}
        >
          <Box sx={{ width: '100%', maxWidth: { xs: '500px', md: '100%' } }}>
            <Paper sx={{ p: 3, mb: 3 }} elevation={2}>
              <Typography variant="h4" gutterBottom sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                {event.title[currentLanguage]}
              </Typography>
              <Box sx={{ 
                position: 'relative',
                width: {
                  xs: '100%',
                  sm: '350px',
                  md: '400px',
                  lg: '600px',
                  xl: '900px',
                },
                maxWidth: '100%',
                mx: { xs: 'auto', md: 0 }
              }}>
                <Typography 
                  variant="body1" 
                  sx={{
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    whiteSpace: 'pre-wrap',
                    textAlign: { xs: 'center', md: 'left' }
                  }}
                >
                  {event.description[currentLanguage]}
                </Typography>
              </Box>
            </Paper>

            <Grid container spacing={2} sx={{ mb: 3 }} columns={12}>
              <Grid gridColumn="span 12" sx={{ '@media (min-width:600px)': { gridColumn: 'span 6' } }}>
                <Paper sx={{ p: 2 }} elevation={2}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                    {t('events.venue')}
                  </Typography>
                  <Typography variant="body1" sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                    {event.venue[currentLanguage]}
                  </Typography>
                </Paper>
              </Grid>
              <Grid gridColumn="span 12" sx={{ '@media (min-width:600px)': { gridColumn: 'span 6' } }}>
                <Paper sx={{ p: 2 }} elevation={2}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                    {t('events.dateTime')}
                  </Typography>
                  <Typography variant="body1" sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                    {formatDate(event.date)}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            <Typography variant="h6" gutterBottom sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              {t('events.tickets')}
            </Typography>
            <Grid 
              container 
              spacing={2}
              columns={12}
              sx={{
                justifyContent: { xs: 'center', md: 'flex-start' }
              }}
            >
              {event.tickets.map((ticket) => (
                <Grid 
                  gridColumn="span 12"
                  key={ticket.category}
                  sx={{
                    '@media (min-width:600px)': { gridColumn: 'span 6' },
                    '@media (min-width:900px)': { gridColumn: 'span 6' },
                    '@media (min-width:1200px)': { gridColumn: 'span 4' },
                    maxWidth: { xs: '400px', md: '100%' }
                  }}
                >
                  <Card sx={{ height: '100%' }} elevation={2}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                        {t(`events.ticketCategories.${ticket.category}`)}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" gutterBottom sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                        {t('events.price')}: {ticket.price} ₸
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                        {t('events.seatsLeft')}: {ticket.capacity}
                      </Typography>
                      <Button
                        variant="contained"
                        fullWidth
                        disabled={ticket.capacity === 0}
                        onClick={() => handleOpenDialog(ticket)}
                      >
                        {ticket.capacity === 0 ? t('events.noSeats') : t('events.book')}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{t('events.bookingTitle')}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              {event.title[currentLanguage]}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t('events.category')}: {selectedTicket?.category}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t('events.price')}: {selectedTicket?.price} ₸
            </Typography>
            <TextField
              fullWidth
              label={t('events.ticketCount')}
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Math.min(selectedTicket?.capacity || 1, parseInt(e.target.value) || 1)))}
              slotProps={{ input: { min: 1, max: selectedTicket?.capacity } }}
              sx={{ mt: 2 }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              {t('events.totalPrice')}: {(selectedTicket?.price || 0) * quantity} ₸
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t('common.cancel')}</Button>
          <Button onClick={handleBooking} variant="contained">
            {t('events.book')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EventDetails; 