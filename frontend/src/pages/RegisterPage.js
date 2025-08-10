import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { colors } from '../theme';

const RegisterPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/login', { replace: true });
  }, [navigate]);

  return (
    <div style={{ padding: '2rem', maxWidth: 520, margin: '0 auto' }}>
      <h1 style={{ margin: 0, color: colors.textPrimary }}>Registration Disabled</h1>
      <p style={{ marginTop: 6, color: colors.textSecondary }}>
        Accounts are provisioned by the university. Please use your college credentials to sign in.
      </p>
      <Link to="/login" style={{ background: colors.primary, color: 'white', border: 'none', borderRadius: 6, padding: '10px 16px', cursor: 'pointer', textDecoration: 'none' }}>
        Go to Login
      </Link>
    </div>
  );
};

export default RegisterPage;