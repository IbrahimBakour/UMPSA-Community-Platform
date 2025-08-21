import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Menu,
  MenuItem,
  Box,
  Chip,
  IconButton,
  Container,
  Divider,
} from '@mui/material';
import {
  AccountCircle,
  ExitToApp,
  Settings,
  Person,
  Group,
  AdminPanelSettings,
  School,
} from '@mui/icons-material';

const Header = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    }
  }, []);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('userClubs');
    localStorage.removeItem('publicPostRequests');
    localStorage.removeItem('publicPosts');
    localStorage.removeItem('reports');
    setUserInfo(null);
    setAnchorEl(null);
    navigate('/login');
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <AdminPanelSettings />;
      case 'club member':
        return <Group />;
      case 'student':
        return <School />;
      default:
        return <Person />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'club member':
        return 'primary';
      case 'student':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <AppBar position="static" elevation={0} sx={{ backgroundColor: 'background.paper', color: 'text.primary' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo/Brand */}
          <Typography
            variant="h6"
            component={Link}
            to="/dashboard"
            sx={{
              textDecoration: 'none',
              color: 'primary.main',
              fontWeight: 700,
              flexGrow: 0,
              mr: 4,
            }}
          >
            UMP Community
          </Typography>

          {/* Navigation Links */}
          {userInfo && (
            <Box sx={{ display: 'flex', gap: 2, flexGrow: 1 }}>
              <Button
                component={Link}
                to="/dashboard"
                color="inherit"
                sx={{ textTransform: 'none' }}
              >
                Dashboard
              </Button>
              <Button
                component={Link}
                to="/clubs"
                color="inherit"
                sx={{ textTransform: 'none' }}
              >
                Clubs
              </Button>
              <Button
                component={Link}
                to="/my-clubs"
                color="inherit"
                sx={{ textTransform: 'none' }}
              >
                My Clubs
              </Button>
              <Button
                component={Link}
                to="/news-feed"
                color="inherit"
                sx={{ textTransform: 'none' }}
              >
                News Feed
              </Button>
              {userInfo.role === 'admin' && (
                <>
                  <Button
                    component={Link}
                    to="/admin"
                    color="inherit"
                    sx={{ textTransform: 'none' }}
                  >
                    Admin
                  </Button>
                  <Button
                    component={Link}
                    to="/users"
                    color="inherit"
                    sx={{ textTransform: 'none' }}
                  >
                    Users
                  </Button>
                  <Button
                    component={Link}
                    to="/reports"
                    color="inherit"
                    sx={{ textTransform: 'none' }}
                  >
                    Reports
                  </Button>
                </>
              )}
            </Box>
          )}

          {/* User Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {userInfo ? (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    icon={getRoleIcon(userInfo.role)}
                    label={userInfo.role}
                    color={getRoleColor(userInfo.role)}
                    size="small"
                    variant="outlined"
                  />
                </Box>
                <IconButton
                  onClick={handleMenuOpen}
                  sx={{ p: 0 }}
                >
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: 'primary.main',
                      color: 'white',
                    }}
                  >
                    {userInfo.name.charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  PaperProps={{
                    sx: {
                      mt: 1,
                      minWidth: 200,
                      borderRadius: 2,
                    },
                  }}
                >
                  <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {userInfo.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {userInfo.email}
                    </Typography>
                    <Chip
                      icon={getRoleIcon(userInfo.role)}
                      label={userInfo.role}
                      color={getRoleColor(userInfo.role)}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </Box>
                  <MenuItem
                    component={Link}
                    to="/profile"
                    onClick={handleMenuClose}
                    sx={{ py: 1.5 }}
                  >
                    <Person sx={{ mr: 2 }} />
                    Profile
                  </MenuItem>
                  <MenuItem
                    component={Link}
                    to="/settings"
                    onClick={handleMenuClose}
                    sx={{ py: 1.5 }}
                  >
                    <Settings sx={{ mr: 2 }} />
                    Settings
                  </MenuItem>
                  <Divider />
                  <MenuItem
                    onClick={handleLogout}
                    sx={{ py: 1.5, color: 'error.main' }}
                  >
                    <ExitToApp sx={{ mr: 2 }} />
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  component={Link}
                  to="/login"
                  variant="outlined"
                  color="primary"
                  sx={{ textTransform: 'none' }}
                >
                  Login
                </Button>
                <Button
                  component={Link}
                  to="/register"
                  variant="contained"
                  color="primary"
                  sx={{ textTransform: 'none' }}
                >
                  Register
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header; 