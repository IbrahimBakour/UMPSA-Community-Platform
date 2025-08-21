import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Chip,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Search,
  Add,
  Group,
  Category,
  LocationOn,
  People,
  Visibility,
} from '@mui/icons-material';

const ClubsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [userInfo, setUserInfo] = useState(null);

  // Demo clubs data
  const DEMO_CLUBS = [
    {
      id: 1,
      name: 'Computer Science Club',
      description: 'A community for computer science enthusiasts to share knowledge and collaborate on projects.',
      category: 'Technology',
      memberCount: 45,
      image: 'https://via.placeholder.com/300x200/1976d2/ffffff?text=CS+Club',
      location: 'Faculty of Computing',
      isPublic: true,
    },
    {
      id: 2,
      name: 'Photography Society',
      description: 'Capture moments and learn photography techniques from fellow enthusiasts.',
      category: 'Arts & Culture',
      memberCount: 32,
      image: 'https://via.placeholder.com/300x200/e91e63/ffffff?text=Photo+Soc',
      location: 'Student Center',
      isPublic: true,
    },
    {
      id: 3,
      name: 'Environmental Awareness Club',
      description: 'Promoting environmental consciousness and sustainable practices on campus.',
      category: 'Environment',
      memberCount: 28,
      image: 'https://via.placeholder.com/300x200/4caf50/ffffff?text=Green+Club',
      location: 'Faculty of Science',
      isPublic: true,
    },
    {
      id: 4,
      name: 'Business & Entrepreneurship Club',
      description: 'Fostering business skills and entrepreneurial mindset among students.',
      category: 'Business',
      memberCount: 56,
      image: 'https://via.placeholder.com/300x200/ff9800/ffffff?text=Business+Club',
      location: 'Faculty of Business',
      isPublic: true,
    },
    {
      id: 5,
      name: 'Sports & Fitness Club',
      description: 'Promoting healthy lifestyle and sports activities on campus.',
      category: 'Sports',
      memberCount: 78,
      image: 'https://via.placeholder.com/300x200/795548/ffffff?text=Sports+Club',
      location: 'Sports Complex',
      isPublic: true,
    },
    {
      id: 6,
      name: 'Language Exchange Club',
      description: 'Practice different languages and learn about various cultures.',
      category: 'Education',
      memberCount: 23,
      image: 'https://via.placeholder.com/300x200/9c27b0/ffffff?text=Language+Club',
      location: 'Faculty of Languages',
      isPublic: true,
    },
  ];

  const categories = ['all', 'Technology', 'Arts & Culture', 'Environment', 'Business', 'Sports', 'Education'];

  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    }
  }, []);

  const filteredClubs = DEMO_CLUBS.filter(club => {
    const matchesSearch = club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         club.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || club.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category) => {
    const colorMap = {
      'Technology': 'primary',
      'Arts & Culture': 'secondary',
      'Environment': 'success',
      'Business': 'warning',
      'Sports': 'info',
      'Education': 'error',
    };
    return colorMap[category] || 'default';
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight={600}>
          Discover Clubs
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Join exciting communities and connect with like-minded students
        </Typography>
      </Box>

      {/* Search and Filter Section */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search clubs by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                label="Category"
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            {userInfo?.role === 'admin' && (
              <Button
                component={Link}
                to="/create-club"
                variant="contained"
                startIcon={<Add />}
                fullWidth
                size="large"
              >
                Create New Club
              </Button>
            )}
          </Grid>
        </Grid>
      </Box>

      {/* Results Count */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {filteredClubs.length} of {DEMO_CLUBS.length} clubs
        </Typography>
      </Box>

      {/* Clubs Grid */}
      <Grid container spacing={3}>
        {filteredClubs.map((club) => (
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
                image={club.image}
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
                    <Category sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Chip
                      label={club.category}
                      color={getCategoryColor(club.category)}
                      size="small"
                      variant="outlined"
                    />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {club.location}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <People sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {club.memberCount} members
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
                  variant="outlined"
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

      {/* Empty State */}
      {filteredClubs.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No clubs found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search terms or category filter
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default ClubsPage; 