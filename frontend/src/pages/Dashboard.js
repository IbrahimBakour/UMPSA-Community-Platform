import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '../theme';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  Stack,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import ReportIcon from '@mui/icons-material/Report';
import FlagIcon from '@mui/icons-material/Flag';
import CampaignIcon from '@mui/icons-material/Campaign';
import WorkspacesIcon from '@mui/icons-material/Workspaces';
import NewspaperIcon from '@mui/icons-material/Newspaper';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (!storedUserInfo) {
      navigate('/login');
      return;
    }

    try {
      const user = JSON.parse(storedUserInfo);
      setUserInfo(user);
    } catch (error) {
      console.error('Error parsing user info:', error);
      navigate('/login');
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'student':
        return 'Student';
      case 'club_member':
        return 'Club Member';
      case 'admin':
        return 'Administrator';
      default:
        return role;
    }
  };

  const getRoleChipColor = (role) => {
    switch (role) {
      case 'student':
        return 'success';
      case 'club_member':
        return 'primary';
      case 'admin':
        return 'error';
      default:
        return 'default';
    }
  };

  const getDashboardContent = (role) => {
    switch (role) {
      case 'student':
        return {
          title: 'Student Dashboard',
          description: 'Welcome to your student dashboard. Here you can view clubs, join activities, and manage your profile.',
          features: [
            'Browse available clubs',
            'Join club activities',
            'View your club memberships',
            'Update your profile',
            'View announcements'
          ]
        };
      case 'club_member':
        return {
          title: 'Club Member Dashboard',
          description: 'Welcome to your club member dashboard. Here you can manage your club activities and members.',
          features: [
            'Manage club activities',
            'View club members',
            'Create announcements',
            'Manage club events',
            'View club analytics'
          ]
        };
      case 'admin':
        return {
          title: 'Administrator Dashboard',
          description: 'Welcome to the administrator dashboard. Here you can manage the entire system.',
          features: [
            'Manage all users',
            'Approve club registrations',
            'System analytics',
            'Manage announcements',
            'System settings'
          ]
        };
      default:
        return {
          title: 'Dashboard',
          description: 'Welcome to your dashboard.',
          features: []
        };
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" height="80vh">
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">Loading...</Typography>
        </Stack>
      </Box>
    );
  }

  if (!userInfo) return null;

  const dashboardContent = getDashboardContent(userInfo.role);

  const handleQuick = (path) => navigate(path);

  const myClubsCount = (() => {
    try { return (JSON.parse(localStorage.getItem('userClubs') || '[]') || []).length; } catch { return 0; }
  })();
  const requestsCount = (() => {
    try { return (JSON.parse(localStorage.getItem('publicPostRequests') || '[]') || []).length; } catch { return 0; }
  })();
  const reportsCount = (() => {
    try { return (JSON.parse(localStorage.getItem('reports') || '[]') || []).length; } catch { return 0; }
  })();
  const publicPostsCount = (() => {
    try { return (JSON.parse(localStorage.getItem('publicPosts') || '[]') || []).length; } catch { return 0; }
  })();

  const statCards = userInfo.role === 'admin'
    ? [
        { title: 'Users', value: '—', icon: <GroupsIcon />, color: 'primary.main', to: '/users' },
        { title: 'Reports', value: reportsCount, icon: <ReportIcon />, color: 'error.main', to: '/reports' },
        { title: 'Requests', value: requestsCount, icon: <FlagIcon />, color: 'warning.main', to: '/reports' },
        { title: 'Announcements', value: '—', icon: <CampaignIcon />, color: 'info.main', to: '/announcements' },
      ]
    : [
        { title: 'My Clubs', value: myClubsCount, icon: <WorkspacesIcon />, color: 'primary.main', to: '/my-clubs' },
        { title: 'News', value: publicPostsCount, icon: <NewspaperIcon />, color: 'success.main', to: '/news' },
        { title: 'Announcements', value: '—', icon: <CampaignIcon />, color: 'info.main', to: '/announcements' },
        { title: 'Browse Clubs', value: '→', icon: <GroupsIcon />, color: 'secondary.main', to: '/clubs' },
      ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Welcome Banner */}
      <Paper elevation={0} sx={{ mb: 3, p: 3, borderRadius: 3, background: 'linear-gradient(135deg, #18458B 0%, #00a389 100%)', color: 'white' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" gap={2}>
          <Box>
            <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Welcome back</Typography>
            <Typography variant="h5" fontWeight={700}>{userInfo.name}</Typography>
            <Stack direction="row" spacing={1} mt={1}>
              <Chip size="small" label={getRoleDisplayName(userInfo.role)} color={getRoleChipColor(userInfo.role)} sx={{ bgcolor: 'rgba(255,255,255,0.15)' }} />
              <Typography variant="caption" sx={{ opacity: 0.9 }}>Last login: {new Date(userInfo.loginTime).toLocaleString()}</Typography>
            </Stack>
          </Box>
          <Button variant="outlined" color="inherit" onClick={handleLogout} sx={{ borderRadius: 2, borderColor: 'rgba(255,255,255,0.6)' }}>Logout</Button>
        </Box>
      </Paper>

      {/* Stat Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {statCards.map((s, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card onClick={() => handleQuick(s.to)} sx={{ borderRadius: 2, cursor: 'pointer', '&:hover': { boxShadow: 4 } }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: s.color }}>{s.icon}</Avatar>
                  <Box>
                    <Typography variant="overline" color="text.secondary" display="block">{s.title}</Typography>
                    <Typography variant="h6" color="text.primary">{String(s.value)}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* User Info */}
      <Card elevation={1} sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="text.primary">User Information</Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                {userInfo.name?.charAt(0)?.toUpperCase() || '?'}
              </Avatar>
            </Grid>
            <Grid item xs={12} sm={5} md={4}>
              <Typography variant="caption" color="text.secondary">Name</Typography>
              <Typography variant="body1" color="text.primary">{userInfo.name}</Typography>
            </Grid>
            <Grid item xs={12} sm={5} md={4}>
              <Typography variant="caption" color="text.secondary">Email</Typography>
              <Typography variant="body1" color="text.primary">{userInfo.email}</Typography>
            </Grid>
            <Grid item xs={12} sm={4} md={3}>
              <Typography variant="caption" color="text.secondary">Role</Typography>
              <Box mt={0.5}>
                <Chip size="small" label={getRoleDisplayName(userInfo.role)} color={getRoleChipColor(userInfo.role)} />
              </Box>
            </Grid>
            <Grid item xs={12} sm={8} md={5}>
              <Typography variant="caption" color="text.secondary">Login Time</Typography>
              <Typography variant="body1" color="text.primary">{new Date(userInfo.loginTime).toLocaleString()}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Features Grid */}
      <Box mb={3}>
        <Typography variant="h6" color="text.primary" gutterBottom>Available Features</Typography>
        <Grid container spacing={2}>
          {dashboardContent.features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card variant="outlined" sx={{ borderRadius: 2, cursor: 'pointer', '&:hover': { boxShadow: 3 } }}>
                <CardContent>
                  <Typography variant="subtitle1" color="primary" gutterBottom>{feature}</Typography>
                  <Typography variant="body2" color="text.secondary">Click to access this feature</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Quick Actions */}
      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
        <Typography variant="h6" color="text.primary" gutterBottom>Quick Actions</Typography>
        <Stack direction="row" spacing={1.5} flexWrap="wrap">
          <Button variant="contained" onClick={() => handleQuick('/profile')}>View Profile</Button>
          <Button variant="contained" color="info" onClick={() => handleQuick('/clubs')}>Browse Clubs</Button>
          <Button variant="contained" color="success" onClick={() => handleQuick('/announcements')}>View Announcements</Button>
          {userInfo.role === 'admin' && (
            <Button variant="outlined" color="warning" onClick={() => handleQuick('/admin')}>Admin</Button>
          )}
        </Stack>
      </Paper>

      {/* Recent */}
      <Box mt={3}>
        <Typography variant="h6" color="text.primary" gutterBottom>Recent</Typography>
        <Paper variant="outlined" sx={{ borderRadius: 2 }}>
          <List>
            {(publicPostsCount > 0 ? JSON.parse(localStorage.getItem('publicPosts') || '[]').slice(0, 3) : [])
              .map((p, idx) => (
                <ListItem key={idx} divider={idx < Math.min(publicPostsCount, 3) - 1}>
                  <ListItemAvatar>
                    <Avatar src={p.authorAvatar} />
                  </ListItemAvatar>
                  <ListItemText primary={p.author} secondary={p.content} />
                </ListItem>
              ))}
            {publicPostsCount === 0 && (
              <ListItem>
                <ListItemText primary="No recent items" secondary="Public posts will appear here." />
              </ListItem>
            )}
          </List>
        </Paper>
      </Box>
    </Container>
  );
};

export default Dashboard; 