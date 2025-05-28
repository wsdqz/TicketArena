import React from 'react';
import { Card, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';

const EventCard = ({ event }) => {
  const navigate = useNavigate();
  const { t, currentLanguage } = useTranslation();
  const { id, title, description, date, venue, category, image_url } = event;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  };

  const handleClick = () => {
    navigate(`/events/${id}`);
  };

  return (
    <Card 
      sx={{ 
        maxWidth: 345,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        '&:hover': {
          boxShadow: 6
        }
      }}
      onClick={handleClick}
    >
      <img
        src={image_url || '/placeholder.jpg'}
        alt={title[currentLanguage]}
        style={{
          height: 200,
          objectFit: 'cover'
        }}
      />
      <div style={{ padding: 16, flexGrow: 1 }}>
        <Typography variant="h6" gutterBottom>
          {title[currentLanguage]}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {description[currentLanguage].slice(0, 100)}...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {formatDate(date)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {venue[currentLanguage]}
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            bgcolor: 'primary.main',
            color: 'white',
            px: 1,
            py: 0.5,
            borderRadius: 1,
            display: 'inline-block',
            mt: 1
          }}
        >
          {t(`events.categories.${category.toLowerCase()}`)}
        </Typography>
      </div>
      <Button 
        variant="contained" 
        fullWidth 
        sx={{ mt: 'auto', borderRadius: '0 0 4px 4px' }}
      >
        {t('events.book')}
      </Button>
    </Card>
  );
};

export default EventCard; 