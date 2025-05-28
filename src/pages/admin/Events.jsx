import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
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
  MenuItem,
  Box,
  Alert,
  Divider,
  CircularProgress,
  Pagination
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { DesktopDateTimePicker } from '@mui/x-date-pickers/DesktopDateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ruLocale from 'date-fns/locale/ru';
import { useTranslation } from '../../hooks/useTranslation';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { parseISO, format } from 'date-fns';

const Events = () => {
  const { t, currentLanguage } = useTranslation();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [dialogError, setDialogError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 10;
  const [search, setSearch] = useState('');

  const ticketCategories = [
    { id: 'standard', defaultAge: '13+' },
    { id: 'child', defaultAge: '0-12' },
    { id: 'vip', defaultAge: '13+' }
  ];

  const [formData, setFormData] = useState({
    title: {
      ru: '',
      en: ''
    },
    description: {
      ru: '',
      en: ''
    },
    date: new Date(),
    venue: {
      ru: '',
      en: ''
    },
    category: '',
    image_url: '',
    tickets: [
      { 
        category: 'standard', 
        price: 0, 
        capacity: 0,
        ageRestriction: '13+'
      }
    ]
  });

  const categories = [
    t('events.categories.football'),
    t('events.categories.basketball'),
    t('events.categories.hockey'),
    t('events.categories.tennis')
  ];

  useEffect(() => {
    fetchEvents();
  }, [page]);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/events?page=${page}&per_page=${perPage}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error(t('errors.loadEvents'));
      const data = await response.json();
      setEvents(data.items || []);
      setTotalPages(data.pages || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (event = null) => {
    setDialogError('');
    if (event) {
      setSelectedEvent(event);
      setFormData({
        title: {
          ru: event.title?.ru || event.title || '',
          en: event.title?.en || event.title || ''
        },
        description: {
          ru: event.description?.ru || event.description || '',
          en: event.description?.en || event.description || ''
        },
        date: new Date(event.date),
        venue: {
          ru: event.venue?.ru || event.venue || '',
          en: event.venue?.en || event.venue || ''
        },
        category: event.category,
        image_url: event.image_url,
        tickets: event.tickets?.map(ticket => ({
          ...ticket,
          ageRestriction: ticket.ageRestriction || '13+'
        })) || [
          { 
            category: 'standard', 
            price: 0, 
            capacity: 0,
            ageRestriction: '13+'
          }
        ]
      });
    } else {
      setSelectedEvent(null);
      setFormData({
        title: {
          ru: '',
          en: ''
        },
        description: {
          ru: '',
          en: ''
        },
        date: new Date(),
        venue: {
          ru: '',
          en: ''
        },
        category: '',
        image_url: '',
        tickets: [
          { 
            category: 'standard', 
            price: 0, 
            capacity: 0,
            ageRestriction: '13+'
          }
        ]
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEvent(null);
    setDialogError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setDialogError('');
    setSaving(true);

    // Дополнительная валидация для всех языков
    const requiredFields = [
      formData.title.ru,
      formData.title.en,
      formData.description.ru,
      formData.description.en,
      formData.venue.ru,
      formData.venue.en
    ];
    if (requiredFields.some(field => !field || field.trim() === '')) {
      setDialogError(t('errors.fillAllFields'));
      setSaving(false);
      return;
    }

    try {
      const url = selectedEvent
        ? `http://localhost:5000/api/events/${selectedEvent.id}`
        : 'http://localhost:5000/api/events';
      
      console.log('Form data being sent:', formData);
      
      const response = await fetch(url, {
        method: selectedEvent ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Server response:', data);

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Save event error');
      }

      await fetchEvents();
      handleCloseDialog();
    } catch (err) {
      console.error('Full error:', err);
      setDialogError(err.message || 'Unknown error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (event) => {
    setEventToDelete(event);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteCancel = () => {
    setEventToDelete(null);
    setDeleteConfirmOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!eventToDelete) return;

    try {
      console.log('Attempting to delete event:', eventToDelete);
      
      const response = await fetch(`http://localhost:5000/api/events/${eventToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      console.log('Delete response status:', response.status);
      
      const text = await response.text();
      console.log('Raw response:', text);
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(text);
        } catch (e) {
          console.error('Failed to parse error response:', e);
          throw new Error('Delete event error');
        }
        
        if (errorData.error && errorData.error.includes('related bookings')) {
          throw new Error(t('errors.deleteEventWithBookings'));
        } else if (errorData.error && errorData.error.includes('NOT NULL constraint failed')) {
          throw new Error(t('errors.deleteEventConstraint'));
        } else {
          throw new Error(errorData.error || t('errors.deleteEvent'));
        }
      }

      setError('');
      await fetchEvents();
    } catch (err) {
      console.error('Full error details:', err);
      setError(err.message || t('errors.deleteEvent'));
    } finally {
      setDeleteConfirmOpen(false);
      setEventToDelete(null);
    }
  };

  const handleTicketChange = (index, field, value) => {
    const newTickets = [...formData.tickets];
    if (field === 'category') {
      const selectedCategory = ticketCategories.find(cat => cat.id === value);
      newTickets[index] = {
        ...newTickets[index],
        category: value,
        ageRestriction: selectedCategory.defaultAge
      };
    } else {
      newTickets[index] = {
        ...newTickets[index],
        [field]: field === 'price' || field === 'capacity' ? Number(value) : value
      };
    }
    setFormData({ ...formData, tickets: newTickets });
  };

  const handleAddTicket = () => {
    setFormData({
      ...formData,
      tickets: [...formData.tickets, { 
        category: 'standard', 
        price: 0, 
        capacity: 0,
        ageRestriction: '13+'
      }]
    });
  };

  const handleRemoveTicket = (index) => {
    const newTickets = formData.tickets.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      tickets: newTickets
    });
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // search by events through useMemo
  const filteredEvents = useMemo(() => {
    const searchLower = search.toLowerCase();
    return events.filter(event => {
      const titleText = event.title?.[currentLanguage]?.toLowerCase() || '';
      const descriptionText = event.description?.[currentLanguage]?.toLowerCase() || '';
      const venueText = event.venue?.[currentLanguage]?.toLowerCase() || '';
      return (
        titleText.includes(searchLower) ||
        descriptionText.includes(searchLower) ||
        venueText.includes(searchLower)
      );
    });
  }, [events, search, currentLanguage]);

  if (loading) return <Typography>{t('common.loading')}</Typography>;

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">{t('admin.manageEvents')}</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
        >
          {t('events.addEvent')}
        </Button>
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
        margin="normal"
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('events.eventName')}</TableCell>
              <TableCell>{t('events.eventDate')}</TableCell>
              <TableCell>{t('events.eventVenue')}</TableCell>
              <TableCell>{t('events.eventCategory')}</TableCell>
              <TableCell>{t('common.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEvents.map((event) => (
              <TableRow key={event.id}>
                <TableCell>
                  {typeof event.title === 'object'
                    ? (event.title[currentLanguage] || event.title['ru'] || event.title['en'] || '—')
                    : (event.title || '—')}
                </TableCell>
                <TableCell>
                  {format(parseISO(event.date), 'dd.MM.yyyy HH:mm')}
                </TableCell>
                <TableCell>
                  {typeof event.venue === 'object'
                    ? (event.venue[currentLanguage] || event.venue['ru'] || event.venue['en'] || '—')
                    : (event.venue || '—')}
                </TableCell>
                <TableCell>{t('events.categories.' + event.category)}</TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenDialog(event)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteClick(event)}
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

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle>
          {selectedEvent ? t('events.editEvent') : t('events.addEvent')}
        </DialogTitle>
        <DialogContent>
          {dialogError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {dialogError}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' },
              gap: 3,
              mb: 4
            }}>
              {/* ru*/}
              <Box sx={{ flex: 1, width: { xs: '100%', md: '50%' } }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  {t('events.russianContent')}
                </Typography>
                <TextField
                  fullWidth
                  label={t('events.eventName')}
                  value={formData.title.ru}
                  onChange={(e) => setFormData({
                    ...formData,
                    title: { ...formData.title, ru: e.target.value }
                  })}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label={t('events.eventDescription')}
                  value={formData.description.ru}
                  onChange={(e) => setFormData({
                    ...formData,
                    description: { ...formData.description, ru: e.target.value }
                  })}
                  margin="normal"
                  multiline
                  rows={4}
                  required
                />
                <TextField
                  fullWidth
                  label={t('events.eventVenue')}
                  value={formData.venue.ru}
                  onChange={(e) => setFormData({
                    ...formData,
                    venue: { ...formData.venue, ru: e.target.value }
                  })}
                  margin="normal"
                  required
                />
              </Box>

              {/* en */}
              <Box sx={{ flex: 1, width: { xs: '100%', md: '50%' } }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  {t('events.englishContent')}
                </Typography>
                <TextField
                  fullWidth
                  label={t('events.eventName')}
                  value={formData.title.en}
                  onChange={(e) => setFormData({
                    ...formData,
                    title: { ...formData.title, en: e.target.value }
                  })}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label={t('events.eventDescription')}
                  value={formData.description.en}
                  onChange={(e) => setFormData({
                    ...formData,
                    description: { ...formData.description, en: e.target.value }
                  })}
                  margin="normal"
                  multiline
                  rows={4}
                  required
                />
                <TextField
                  fullWidth
                  label={t('events.eventVenue')}
                  value={formData.venue.en}
                  onChange={(e) => setFormData({
                    ...formData,
                    venue: { ...formData.venue, en: e.target.value }
                  })}
                  margin="normal"
                  required
                />
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* other fields */}
            <Box>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={currentLanguage === 'ru' ? ruLocale : undefined}>
                <DesktopDateTimePicker
                  label={t('events.eventDate')}
                  value={formData.date}
                  onChange={(newValue) => setFormData({ ...formData, date: newValue })}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth margin="normal" required />
                  )}
                  ampm={false}
                  format={currentLanguage === 'ru' ? 'dd.MM.yyyy HH:mm' : 'MM/dd/yyyy HH:mm'}
                />
              </LocalizationProvider>

              <TextField
                select
                fullWidth
                label={t('events.eventCategory')}
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                margin="normal"
                required
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                label={t('events.imageUrl')}
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                margin="normal"
              />

              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                {t('events.tickets')}
              </Typography>
              {formData.tickets.map((ticket, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                  <TextField
                    select
                    label={t('events.ticketCategory')}
                    value={ticket.category}
                    onChange={(e) => handleTicketChange(index, 'category', e.target.value)}
                    sx={{ flex: 1 }}
                    required
                  >
                    {ticketCategories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {t(`events.ticketCategories.${category.id}`)}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    type="number"
                    label={t('events.ticketPrice')}
                    value={ticket.price}
                    onChange={(e) => handleTicketChange(index, 'price', e.target.value)}
                    sx={{ flex: 1 }}
                    required
                  />
                  <TextField
                    type="number"
                    label={t('events.ticketCapacity')}
                    value={ticket.capacity}
                    onChange={(e) => handleTicketChange(index, 'capacity', e.target.value)}
                    sx={{ flex: 1 }}
                    required
                  />
                  <TextField
                    label={t('events.ticketAgeRestriction')}
                    value={ticket.ageRestriction}
                    onChange={(e) => handleTicketChange(index, 'ageRestriction', e.target.value)}
                    sx={{ flex: 1.5 }}
                    placeholder="13+"
                  />
                  <IconButton 
                    color="error" 
                    onClick={() => handleRemoveTicket(index)}
                    disabled={formData.tickets.length === 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Button
                variant="outlined"
                onClick={handleAddTicket}
                startIcon={<AddIcon />}
                sx={{ mt: 1 }}
              >
                {t('events.addTicket')}
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={saving}>
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={saving}
            startIcon={saving && <CircularProgress size={20} />}
          >
            {saving ? t('common.saving') : t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirmOpen}
        title={t('events.deleteTitle')}
        message={t('events.deleteMessage')}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </Container>
  );
};

export default Events; 