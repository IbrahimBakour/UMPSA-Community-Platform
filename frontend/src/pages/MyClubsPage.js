import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Chip,
  Avatar,
  Stack,
  Divider,
  Alert,
} from '@mui/material';
import {
  Group,
  Visibility,
  LocationOn,
  People,
  Add,
  Explore,
} from '@mui/icons-material';

const MyClubsPage = () => {
  const [userClubs, setUserClubs] = useState([]);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    const storedUserClubs = localStorage.getItem('userClubs');
    
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    }
    
    if (storedUserClubs) {
      setUserClubs(JSON.parse(storedUserClubs));
    }
  }, []);

  const getRoleColor = (role) => {
    switch (role) {
      case 'leader':
        return 'error';
      case 'member':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'leader':
        return <Group />;
      case 'member':
        return <People />;
      default:
        return <Group />;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight={600}>
          My Clubs
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your club memberships and activities
        </Typography>
      </Box>

      {/* Content */}
      {userClubs.length > 0 ? (
        <Grid container spacing={3}>
          {userClubs.map((club) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={club.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={club.banner || `https://via.placeholder.com/300x200/1976d2/ffffff?text=${club.name.charAt(0)}`}
                  alt={club.name}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" component="h2" gutterBottom fontWeight={600}>
                      {club.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {club.description}
                    </Typography>
                  </Box>

                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Group sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Chip
                        icon={getRoleIcon(club.userRole)}
                        label={club.userRole}
                        color={getRoleColor(club.userRole)}
                        size="small"
                        variant="outlined"
                      />
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {club.location || 'Campus'}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <People sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {club.memberCount || 0} members
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Visibility sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {club.isPublic ? 'Public' : 'Private'}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>

                <Divider />

                <CardActions sx={{ p: 3, pt: 2 }}>
                  <Button
                    component={Link}
                    to={`/clubs/${club.id}`}
                    variant="contained"
                    fullWidth
                    startIcon={<Group />}
                  >
                    View Club
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: 'grey.200',
              mx: 'auto',
              mb: 2,
            }}
          >
            <Group sx={{ fontSize: 40, color: 'grey.600' }} />
          </Avatar>
          <Typography variant="h5" gutterBottom fontWeight={600}>
            No Clubs Yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            You haven't joined any clubs yet. Start exploring to find communities that interest you!
          </Typography>
          <Button
            component={Link}
            to="/clubs"
            variant="contained"
            size="large"
            startIcon={<Explore />}
            sx={{ mr: 2 }}
          >
            Browse Clubs
          </Button>
          <Button
            component={Link}
            to="/create-club"
            variant="outlined"
            size="large"
            startIcon={<Add />}
            disabled={userInfo?.role !== 'admin'}
          >
            Create Club
          </Button>
        </Box>
      )}

      {/* Info Alert */}
      <Alert severity="info" sx={{ mt: 4 }}>
        <Typography variant="body2">
          <strong>Note:</strong> Club memberships are currently stored locally. In the full system, 
          this data will be synchronized with your account on the server.
        </Typography>
      </Alert>
    </Container>
  );
};

export default MyClubsPage;