import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import {
  Email,
  LockOutlined,
  CheckCircle,
  ArrowBack,
} from '@mui/icons-material';

const ForgotPasswordPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const steps = [
    {
      label: 'Enter Email',
      description: 'Enter your email address to receive a verification code.',
    },
    {
      label: 'Verify OTP',
      description: 'Enter the 6-digit code sent to your email.',
    },
    {
      label: 'New Password',
      description: 'Create a new password for your account.',
    },
  ];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSendOTP = async () => {
    if (!formData.email) {
      setError('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    setError('');

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setSuccess('Verification code sent to your email!');
      handleNext();
    }, 1500);
  };

  const handleVerifyOTP = async () => {
    if (!formData.otp) {
      setError('Please enter the verification code.');
      return;
    }

    if (formData.otp.length !== 6) {
      setError('Please enter a valid 6-digit code.');
      return;
    }

    setIsLoading(true);
    setError('');

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setSuccess('OTP verified successfully!');
      handleNext();
    }, 1000);
  };

  const handleResetPassword = async () => {
    if (!formData.newPassword || !formData.confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    setError('');

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setSuccess('Password reset successfully! You can now login with your new password.');
    }, 1500);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="body1" sx={{ mb: 3 }}>
              {steps[0].description}
            </Typography>
            <TextField
              fullWidth
              label="Email Address"
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
            <Button
              variant="contained"
              onClick={handleSendOTP}
              disabled={isLoading}
              sx={{ mr: 1 }}
            >
              {isLoading ? <CircularProgress size={20} /> : 'Send Code'}
            </Button>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="body1" sx={{ mb: 3 }}>
              {steps[1].description}
            </Typography>
            <TextField
              fullWidth
              label="Verification Code"
              name="otp"
              value={formData.otp}
              onChange={handleChange}
              required
              placeholder="Enter 6-digit code"
              sx={{ mb: 3 }}
              inputProps={{ maxLength: 6 }}
            />
            <Button
              variant="contained"
              onClick={handleVerifyOTP}
              disabled={isLoading}
              sx={{ mr: 1 }}
            >
              {isLoading ? <CircularProgress size={20} /> : 'Verify Code'}
            </Button>
            <Button onClick={handleBack} sx={{ mr: 1 }}>
              Back
            </Button>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="body1" sx={{ mb: 3 }}>
              {steps[2].description}
            </Typography>
            <TextField
              fullWidth
              label="New Password"
              name="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={handleChange}
              required
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: <LockOutlined sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: <LockOutlined sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
            <Button
              variant="contained"
              onClick={handleResetPassword}
              disabled={isLoading}
              sx={{ mr: 1 }}
            >
              {isLoading ? <CircularProgress size={20} /> : 'Reset Password'}
            </Button>
            <Button onClick={handleBack}>
              Back
            </Button>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
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
            Reset Your Password
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Follow the steps below to reset your password
          </Typography>
        </Box>

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        {/* Stepper */}
        <Stepper activeStep={activeStep} orientation="vertical" sx={{ mb: 4 }}>
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel
                StepIconComponent={index < activeStep ? CheckCircle : undefined}
                StepIconProps={index < activeStep ? { color: 'success' } : {}}
              >
                <Typography variant="h6" fontWeight={600}>
                  {step.label}
                </Typography>
              </StepLabel>
              <StepContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {step.description}
                </Typography>
                {renderStepContent(index)}
              </StepContent>
            </Step>
          ))}
        </Stepper>

        {/* Back to Login */}
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            component={Link}
            to="/login"
            startIcon={<ArrowBack />}
            variant="outlined"
            color="primary"
          >
            Back to Login
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ForgotPasswordPage; 