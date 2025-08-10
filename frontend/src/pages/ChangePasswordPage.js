import React, { useState } from 'react';
import { colors } from '../theme';

const bgUrl = process.env.PUBLIC_URL + '/umpsa_0.jpg';
const logoUrl = process.env.PUBLIC_URL + '/UMPSA Logo.png';

const CORRECT_OTP = '123456'; // For demo/testing only

const ChangePasswordPage = () => {
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    const entered = otp.join('');
    if (entered === CORRECT_OTP) {
      setOtpError('');
      setStep(2);
    } else {
      setOtpError('Incorrect code. Please try again.');
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    // Add password validation here if needed
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    alert('Password changed successfully!');
    // Reset form or redirect as needed
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
      {/* Card */}
      <form
        onSubmit={step === 1 ? handleOtpSubmit : handlePasswordSubmit}
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
          marginTop: 120, // to avoid overlap with nav
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
        {step === 1 ? (
          <>
            <div style={{ textAlign: 'center', color: colors.textSecondary, marginBottom: 8 }}>
              Enter the 6-digit code sent to your email
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
                  style={{
                    width: 40,
                    height: 48,
                    fontSize: 24,
                    textAlign: 'center',
                    border: '1.5px solid #ccc',
                    borderRadius: 6,
                    outline: 'none',
                    background: '#f8f9fa',
                  }}
                  autoFocus={idx === 0}
                />
              ))}
            </div>
            {otpError && <div style={{ color: colors.errorText, background: colors.errorBg, borderRadius: 4, padding: '6px 0', textAlign: 'center', fontSize: 15 }}>{otpError}</div>}
            <button
              type="submit"
              style={{
                background: colors.primary,
                color: colors.buttonText,
                border: 'none',
                borderRadius: 4,
                padding: '12px 0',
                fontSize: 18,
                fontWeight: 500,
                cursor: 'pointer',
                marginTop: 8,
              }}
            >
              Verify Code
            </button>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ position: 'relative', marginBottom: 16 }}>
                <input
                  type={showNew ? 'text' : 'password'}
                  placeholder="New Password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
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
            <button
              type="submit"
              style={{
                background: colors.primary,
                color: colors.buttonText,
                border: 'none',
                borderRadius: 4,
                padding: '12px 0',
                fontSize: 18,
                fontWeight: 500,
                cursor: 'pointer',
                marginTop: 8,
              }}
            >
              Change Password
            </button>
          </>
        )}
      </form>
    </div>
  );
};

export default ChangePasswordPage; 