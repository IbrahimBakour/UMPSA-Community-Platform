import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '../theme';

const bgUrl = process.env.PUBLIC_URL + '/umpsa_0.jpg';
const logoUrl = process.env.PUBLIC_URL + '/UMPSA Logo.png';

// Demo users for temporary authentication
const DEMO_USERS = {
  'student@umpsa.edu.my': { password: 'student123', role: 'student', name: 'Ahmad Student' },
  'club@umpsa.edu.my': { password: 'club123', role: 'club_member', name: 'Sara Club Member' },
  'admin@umpsa.edu.my': { password: 'admin123', role: 'admin', name: 'Admin User' }
};

const LoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if user exists in demo users
      const user = DEMO_USERS[email];
      
      if (!user) {
        setError('User not found. Please check your email.');
        return;
      }

      if (user.password !== password) {
        setError('Invalid password. Please try again.');
        return;
      }

      // Store user info in localStorage for temporary session management
      const userInfo = {
        email,
        role: user.role,
        name: user.name,
        isAuthenticated: true,
        loginTime: new Date().toISOString()
      };
      
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      
      // Redirect to dashboard
      navigate('/dashboard');
      
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
        background: 'rgba(255, 255, 255, 0.32)', // less transparent overlay
        zIndex: 1,
      }} />
      {/* Login Card */}
      <form onSubmit={handleSubmit} style={{
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
      }}>
        {/* System name inside the form */}
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
        
        {/* Demo Users Info */}
        <div style={{
          background: '#f8f9fa',
          borderRadius: 6,
          padding: '12px 16px',
          marginBottom: 16,
          border: '1px solid #e9ecef',
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary, marginBottom: 8 }}>
            Demo Users (Temporary):
          </div>
          <div style={{ fontSize: 12, color: colors.textSecondary, lineHeight: 1.4 }}>
            <div><strong>Student:</strong> student@umpsa.edu.my / student123</div>
            <div><strong>Club Member:</strong> club@umpsa.edu.my / club123</div>
            <div><strong>Admin:</strong> admin@umpsa.edu.my / admin123</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={isLoading}
            style={{
              border: 'none',
              borderBottom: '2px solid #eee',
              padding: '12px 0',
              fontSize: 16,
              outline: 'none',
              marginBottom: 24,
              background: 'transparent',
            }}
            required
          />
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
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
              onClick={() => setShowPassword(s => !s)}
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
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? '🙈' : '👁️'}
            </span>
          </div>
        </div>
        
        {error && (
          <div style={{
            color: colors.errorText || '#dc3545',
            background: colors.errorBg || '#f8d7da',
            borderRadius: 4,
            padding: '8px 12px',
            fontSize: 14,
            textAlign: 'center',
          }}>
            {error}
          </div>
        )}
        
        <div style={{ width: 'fit-content', marginBottom: 16 }}>
          <a href="/forgot-password" style={{ color: colors.link, fontSize: 15, textAlign: 'left', cursor: 'pointer', textDecoration: 'none' }}>Forgot Password?</a>
        </div>
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
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default LoginPage; 