import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Chip,
  Stack,
} from '@mui/material';
import {
  LockOutlined,
  Email,
  Visibility,
  VisibilityOff,
  School,
  Group,
  AdminPanelSettings,
} from '@mui/icons-material';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Demo users for testing
  const DEMO_USERS = {
    'student@ump.edu.my': { password: 'student123', name: 'John Student', role: 'student' },
    'member@ump.edu.my': { password: 'member123', name: 'Sarah Member', role: 'club member' },
    'admin@ump.edu.my': { password: 'admin123', name: 'Admin User', role: 'admin' },
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate API call
    setTimeout(() => {
      const user = DEMO_USERS[formData.email];
      
      if (user && user.password === formData.password) {
        const userInfo = {
          email: formData.email,
          name: user.name,
          role: user.role,
          loginTime: new Date().toISOString(),
        };
        
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        navigate('/dashboard');
      } else {
        setError('Invalid email or password');
      }
      setIsLoading(false);
    }, 1000);
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
        return null;
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
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <LockOutlined sx={{ fontSize: 40, color: 'white' }} />
          </Box>
          <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
            Welcome Back
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Sign in to your UMP Community account
          </Typography>
        </Box>

        {/* Login Form */}
        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />

          <TextField
            fullWidth
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            required
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: <LockOutlined sx={{ mr: 1, color: 'text.secondary' }} />,
              endAdornment: (
                <Button
                  onClick={() => setShowPassword(!showPassword)}
                  sx={{ minWidth: 'auto', p: 0.5 }}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </Button>
              ),
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={isLoading}
            sx={{ py: 1.5, mb: 2 }}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Sign In'}
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Link to="/register" style={{ color: 'inherit', textDecoration: 'underline' }}>
                Sign up
              </Link>
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <Link to="/forgot-password" style={{ color: 'inherit', textDecoration: 'underline' }}>
                Forgot Password?
              </Link>
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }}>
          <Chip label="Demo Accounts" variant="outlined" />
        </Divider>

        {/* Demo Users */}
        <Typography variant="h6" gutterBottom textAlign="center">
          Try these demo accounts:
        </Typography>
        
        <Stack spacing={2}>
          {Object.entries(DEMO_USERS).map(([email, user]) => (
            <Card key={email} variant="outlined" sx={{ cursor: 'pointer' }} 
                  onClick={() => setFormData({ email, password: user.password })}>
              <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {user.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {email}
                    </Typography>
                  </Box>
                  <Chip
                    icon={getRoleIcon(user.role)}
                    label={user.role}
                    color={getRoleColor(user.role)}
                    size="small"
                    variant="outlined"
                  />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Password: {user.password}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Paper>
    </Container>
  );
};

export default LoginPage; 