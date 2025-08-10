import React, { useState } from 'react';
import { colors } from '../theme';

const bgUrl = process.env.PUBLIC_URL + '/umpsa_0.jpg';
const logoUrl = process.env.PUBLIC_URL + '/UMPSA Logo.png';

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Handle OTP input
  const handleOtpChange = (e, idx) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[idx] = value;
    setOtp(newOtp);
    // Move to next input if filled
    if (value && idx < 5) {
      document.getElementById(`otp-input-${idx + 1}`).focus();
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/auth/forgot-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email })
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStep(2);
      setMessage('Verification code sent to your email!');
    } catch (error) {
      setMessage('Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const entered = otp.join('');
    if (entered.length !== 6) {
      setOtpError('Please enter the complete 6-digit code.');
      return;
    }

    setIsLoading(true);
    setOtpError('');

    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/auth/verify-otp', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, otp: entered })
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, accept any 6-digit code
      if (entered.length === 6) {
        setStep(3);
        setMessage('');
      } else {
        setOtpError('Invalid verification code. Please try again.');
      }
    } catch (error) {
      setOtpError('Failed to verify code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match!');
      return;
    }

    if (newPassword.length < 6) {
      setMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/auth/reset-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ 
      //     email, 
      //     otp: otp.join(''), 
      //     newPassword 
      //   })
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (error) {
      setMessage('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setEmail('');
    setOtp(['', '', '', '', '', '']);
    setNewPassword('');
    setConfirmPassword('');
    setOtpError('');
    setMessage('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
    }}>
      {/* Top navigation bar with centered logo */}
      <nav style={{
        width: '100%',
        background: '#fff',
        boxShadow: '0 2px 8px #eee',
        padding: '1.5rem 0 1.2rem 0',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 10,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <img
          src={logoUrl}
          alt="UMPSA Logo"
          style={{
            height: 56,
            filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.10))',
            background: 'rgba(255,255,255,0.95)',
            borderRadius: 12,
            padding: 6,
          }}
        />
      </nav>
      
      {/* Background image with overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: `url(${bgUrl}) center/cover no-repeat`,
        zIndex: 0,
      }} />
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(255, 255, 255, 0.32)',
        zIndex: 1,
      }} />
      
      {/* Form Card */}
      <form
        onSubmit={step === 1 ? handleEmailSubmit : step === 2 ? handleOtpSubmit : handlePasswordSubmit}
        style={{
          background: '#fff',
          borderRadius: 8,
          boxShadow: '0 4px 32px rgba(0,0,0,0.12)',
          padding: '2.5rem 2.5rem 2rem 2.5rem',
          minWidth: 380,
          maxWidth: '90vw',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          zIndex: 2,
          marginTop: 120,
        }}
      >
        <div style={{
          fontWeight: 600,
          fontSize: 24,
          color: colors.textPrimary,
          textAlign: 'center',
          letterSpacing: 1,
          textShadow: '0 2px 8px rgba(0,0,0,0.06)',
          marginBottom: 12,
        }}>
          UMPSA Community Platform
        </div>

        {/* Step 1: Email Input */}
        {step === 1 && (
          <>
            <div style={{ textAlign: 'center', color: colors.textSecondary, marginBottom: 8 }}>
              Enter your email address to reset your password
            </div>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                border: 'none',
                borderBottom: '2px solid #eee',
                padding: '12px 0',
                fontSize: 16,
                outline: 'none',
                background: 'transparent',
              }}
              required
              disabled={isLoading}
            />
            {message && (
              <div style={{ 
                color: message.includes('successfully') ? colors.successText || '#28a745' : colors.errorText, 
                background: message.includes('successfully') ? colors.successBg || '#d4edda' : colors.errorBg, 
                borderRadius: 4, 
                padding: '8px 12px', 
                textAlign: 'center', 
                fontSize: 14 
              }}>
                {message}
              </div>
            )}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                background: isLoading ? '#ccc' : colors.primary,
                color: colors.buttonText,
                border: 'none',
                borderRadius: 4,
                padding: '12px 0',
                fontSize: 18,
                fontWeight: 500,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                marginTop: 8,
              }}
            >
              {isLoading ? 'Sending...' : 'Send Reset Code'}
            </button>
          </>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <>
            <div style={{ textAlign: 'center', color: colors.textSecondary, marginBottom: 8 }}>
              Enter the 6-digit code sent to {email}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-input-${idx}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(e, idx)}
                  disabled={isLoading}
                  style={{
                    width: 40,
                    height: 48,
                    fontSize: 24,
                    textAlign: 'center',
                    border: '1.5px solid #ccc',
                    borderRadius: 6,
                    outline: 'none',
                    background: isLoading ? '#f5f5f5' : '#f8f9fa',
                  }}
                  autoFocus={idx === 0}
                />
              ))}
            </div>
            {otpError && (
              <div style={{ 
                color: colors.errorText, 
                background: colors.errorBg, 
                borderRadius: 4, 
                padding: '6px 0', 
                textAlign: 'center', 
                fontSize: 15 
              }}>
                {otpError}
              </div>
            )}
            {message && (
              <div style={{ 
                color: colors.successText || '#28a745', 
                background: colors.successBg || '#d4edda', 
                borderRadius: 4, 
                padding: '8px 12px', 
                textAlign: 'center', 
                fontSize: 14 
              }}>
                {message}
              </div>
            )}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                background: isLoading ? '#ccc' : colors.primary,
                color: colors.buttonText,
                border: 'none',
                borderRadius: 4,
                padding: '12px 0',
                fontSize: 18,
                fontWeight: 500,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                marginTop: 8,
              }}
            >
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              style={{
                background: 'transparent',
                color: colors.link,
                border: 'none',
                padding: '8px 0',
                fontSize: 14,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Back to Email
            </button>
          </>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <>
            <div style={{ textAlign: 'center', color: colors.textSecondary, marginBottom: 8 }}>
              Enter your new password
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ position: 'relative', marginBottom: 16 }}>
                <input
                  type={showNew ? 'text' : 'password'}
                  placeholder="New Password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  disabled={isLoading}
                  style={{
                    border: 'none',
                    borderBottom: '2px solid #eee',
                    padding: '12px 0',
                    fontSize: 16,
                    outline: 'none',
                    width: '100%',
                    background: 'transparent',
                  }}
                  required
                />
                <span
                  onClick={() => setShowNew(s => !s)}
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    cursor: 'pointer',
                    color: colors.textSecondary,
                    fontSize: 20,
                    padding: 4,
                  }}
                  title={showNew ? 'Hide password' : 'Show password'}
                >
                  {showNew ? '🙈' : '👁️'}
                </span>
              </div>
              <div style={{ position: 'relative', marginBottom: 16 }}>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  style={{
                    border: 'none',
                    borderBottom: '2px solid #eee',
                    padding: '12px 0',
                    fontSize: 16,
                    outline: 'none',
                    width: '100%',
                    background: 'transparent',
                  }}
                  required
                />
                <span
                  onClick={() => setShowConfirm(s => !s)}
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    cursor: 'pointer',
                    color: colors.textSecondary,
                    fontSize: 20,
                    padding: 4,
                  }}
                  title={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? '🙈' : '👁️'}
                </span>
              </div>
            </div>
            {message && (
              <div style={{ 
                color: message.includes('successfully') ? colors.successText || '#28a745' : colors.errorText, 
                background: message.includes('successfully') ? colors.successBg || '#d4edda' : colors.errorBg, 
                borderRadius: 4, 
                padding: '8px 12px', 
                textAlign: 'center', 
                fontSize: 14 
              }}>
                {message}
              </div>
            )}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                background: isLoading ? '#ccc' : colors.primary,
                color: colors.buttonText,
                border: 'none',
                borderRadius: 4,
                padding: '12px 0',
                fontSize: 18,
                fontWeight: 500,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                marginTop: 8,
              }}
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </>
        )}
      </form>
    </div>
  );
};

export default ForgotPasswordPage; 