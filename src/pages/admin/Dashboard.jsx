import React from 'react';
import { Container, Typography, Box, Grid } from '@mui/material';
import {
  People as PeopleIcon,
  Event as EventIcon,
  ConfirmationNumber as TicketIcon
} from '@mui/icons-material';
import { useTranslation } from '../../hooks/useTranslation';

const StatCard = ({ title, value, icon: Icon }) => (
  <Box
    sx={{
      p: 3,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '100%',
      bgcolor: 'background.paper',
      borderRadius: 1,
      boxShadow: 1
    }}
  >
    <Box sx={{ mr: 3 }}>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h4">{value}</Typography>
    </Box>
    <Icon sx={{ fontSize: 40, color: 'primary.main' }} />
  </Box>
);

const Dashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = React.useState({
    users: 0,
    events: 0,
    bookings: 0
  });

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/admin/stats', {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" sx={{ mb: 4 }}>
        {t('admin.dashboard')}
      </Typography>

      <Grid container spacing={3} columns={12}>
        <Grid 
          gridColumn="span 12"
          sx={{
            '@media (min-width:600px)': { gridColumn: 'span 6' },
            '@media (min-width:900px)': { gridColumn: 'span 4' }
          }}
        >
          <StatCard
            title={t('admin.totalUsers')}
            value={stats.users}
            icon={PeopleIcon}
          />
        </Grid>
        <Grid 
          gridColumn="span 12"
          sx={{
            '@media (min-width:600px)': { gridColumn: 'span 6' },
            '@media (min-width:900px)': { gridColumn: 'span 4' }
          }}
        >
          <StatCard
            title={t('admin.totalEvents')}
            value={stats.events}
            icon={EventIcon}
          />
        </Grid>
        <Grid 
          gridColumn="span 12"
          sx={{
            '@media (min-width:600px)': { gridColumn: 'span 6' },
            '@media (min-width:900px)': { gridColumn: 'span 4' }
          }}
        >
          <StatCard
            title={t('admin.totalBookings')}
            value={stats.bookings}
            icon={TicketIcon}
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;