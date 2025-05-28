import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  TextField,
  MenuItem,
  InputAdornment,
  Alert,
  Pagination
} from '@mui/material';
import { Search as SearchIcon, CalendarToday as CalendarIcon, LocationOn as LocationIcon } from '@mui/icons-material';
import { useTranslation } from '../hooks/useTranslation';
import { useTheme } from '@mui/material/styles';

const categories = [
  { id: 'all', label: 'common.all' },
  { id: 'Football', label: 'events.categories.football' },
  { id: 'Basketball', label: 'events.categories.basketball' },
  { id: 'Hockey', label: 'events.categories.hockey' },
  { id: 'Tennis', label: 'events.categories.tennis' }
];

const Home = () => {
  const navigate = useNavigate();
  const { t, currentLanguage } = useTranslation();
  const theme = useTheme();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    category: 'all'
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 8;

  useEffect(() => {
    fetchEvents();
  }, [page, filters.category]);

  const fetchEvents = async () => {
    try {
      let url = `http://localhost:5000/api/events?page=${page}&per_page=${perPage}`;
      if (filters.category && filters.category !== 'all') {
        url += `&category=${filters.category}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || t('errors.loadEvents'));
      }
      const data = await response.json();
      setEvents(data.items || []);
      setTotalPages(data.pages || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // event filtering through useMemo (search by name, description, venue)
  const filteredEvents = useMemo(() => {
    const searchLower = filters.search.toLowerCase();
    return events.filter(event => {
      const titleText = event.title[currentLanguage]?.toLowerCase() || '';
      const descriptionText = event.description[currentLanguage]?.toLowerCase() || '';
      const venueText = event.venue[currentLanguage]?.toLowerCase() || '';
      return (
        titleText.includes(searchLower) ||
        descriptionText.includes(searchLower) ||
        venueText.includes(searchLower)
      );
    });
  }, [events, filters.search, currentLanguage]);

  const handleEventClick = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  if (loading) return <Typography>{t('common.loading')}</Typography>;
  if (error) return <Alert severity="error">{t('errors.loadEvents')}</Alert>;

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {t('events.title')}
        </Typography>

        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid columns={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              placeholder={t('common.search')}
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }
              }}
            />
          </Grid>
          <Grid columns={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              label={t('events.eventCategory')}
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {t(category.label)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {filteredEvents.map((event) => (
            <Grid key={event.id} columns={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Card
                sx={{
                  width: 236,
                  cursor: 'pointer',
                  boxShadow: 'none',
                  bgcolor: 'background.default',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    transition: 'all 0.2s ease-in-out'
                  }
                }}
                onClick={() => handleEventClick(event.id)}
              >
                <CardMedia
                  component="img"
                  sx={{
                    width: 236,
                    height: 330,
                    objectFit: 'cover',
                    borderRadius: 2
                  }}
                  image={event.image_url || '/placeholder.jpg'}
                  alt={event.title[currentLanguage]}
                />
                <CardContent sx={{
                  pl: 1,
                  pt: 1.5,
                  flexGrow: 1,
                  bgcolor: theme.palette.background.default
                }}>
                  <Typography 
                    variant="h6" 
                    component="h2" 
                    sx={{ 
                      mb: 1,
                      fontWeight: 500,
                      color: 'text.primary',
                      fontSize: '1rem',
                      lineHeight: 1.2
                    }}
                  >
                    {event.title[currentLanguage]}
                  </Typography>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: 1,
                    mb: 0.5
                  }}>
                    <CalendarIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'text.secondary',
                        fontSize: '0.875rem'
                      }}
                    >
                      {(() => {
                        const date = new Date(event.date);
                        const day = String(date.getDate()).padStart(2, '0');
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const year = date.getFullYear();
                        const hours = String(date.getHours()).padStart(2, '0');
                        const minutes = String(date.getMinutes()).padStart(2, '0');
                        
                        return `${day}.${month}.${year} ${hours}:${minutes}`;
                      })()}
                    </Typography>
                  </Box>

                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: 1,
                    mb: 0.5
                  }}>
                    <LocationIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'text.secondary',
                        fontSize: '0.875rem'
                      }}
                    >
                      {event.venue[currentLanguage]}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {filteredEvents.length === 0 && (
          <Typography variant="h6" align="center" sx={{ mt: 4 }}>
            {t('events.noEvents')}
          </Typography>
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
      </Box>
    </Container>
  );
};

export default Home; 