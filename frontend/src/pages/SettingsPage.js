import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { colors } from '../theme';

const SettingsPage = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('userInfo');
    if (!stored) { navigate('/login'); return; }
    setUserInfo(JSON.parse(stored));
  }, [navigate]);

  return (
    <div style={{ padding: '2rem', maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ margin: 0, color: colors.textPrimary }}>Settings</h1>
      <p style={{ marginTop: 6, color: colors.textSecondary }}>Manage your account and preferences</p>

      <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
        <div style={{ background: 'white', border: '1px solid #eee', borderRadius: 8, padding: '1rem' }}>
          <div style={{ fontWeight: 600, color: colors.textPrimary }}>Account</div>
          <div style={{ color: colors.textSecondary, fontSize: 14 }}>Update your password and account details</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <Link to="/change-password" style={{ background: colors.primary, color: 'white', border: 'none', borderRadius: 6, padding: '8px 12px', cursor: 'pointer', fontSize: 12, textDecoration: 'none' }}>Change Password</Link>
            <Link to="/forgot-password" style={{ background: 'transparent', color: colors.link, border: '1px solid #cbd5e1', borderRadius: 6, padding: '8px 12px', cursor: 'pointer', fontSize: 12, textDecoration: 'none' }}>Forgot Password</Link>
          </div>
        </div>

        <div style={{ background: 'white', border: '1px solid #eee', borderRadius: 8, padding: '1rem' }}>
          <div style={{ fontWeight: 600, color: colors.textPrimary }}>Preferences</div>
          <div style={{ color: colors.textSecondary, fontSize: 14 }}>Appearance options (coming soon)</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button disabled style={{ background: 'transparent', color: '#888', border: '1px dashed #cbd5e1', borderRadius: 6, padding: '8px 12px', fontSize: 12 }}>Theme</button>
            <button disabled style={{ background: 'transparent', color: '#888', border: '1px dashed #cbd5e1', borderRadius: 6, padding: '8px 12px', fontSize: 12 }}>Notifications</button>
          </div>
        </div>

        <div style={{ background: 'white', border: '1px solid #eee', borderRadius: 8, padding: '1rem' }}>
          <div style={{ fontWeight: 600, color: colors.textPrimary }}>Privacy</div>
          <div style={{ color: colors.textSecondary, fontSize: 14 }}>Control your data (coming soon)</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button disabled style={{ background: 'transparent', color: '#888', border: '1px dashed #cbd5e1', borderRadius: 6, padding: '8px 12px', fontSize: 12 }}>Export Data</button>
            <button disabled style={{ background: 'transparent', color: '#888', border: '1px dashed #cbd5e1', borderRadius: 6, padding: '8px 12px', fontSize: 12 }}>Delete Account</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;


