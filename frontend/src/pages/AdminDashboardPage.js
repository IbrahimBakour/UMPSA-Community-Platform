import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '../theme';

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('userInfo');
    if (!stored) { navigate('/login'); return; }
    setUserInfo(JSON.parse(stored));
  }, [navigate]);

  const isAdmin = userInfo?.role === 'admin';

  return (
    <div style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ margin: 0, color: colors.textPrimary }}>Admin</h1>
      <p style={{ marginTop: 6, color: colors.textSecondary }}>System administration</p>

      {!isAdmin && (
        <div style={{ marginTop: '1rem', color: colors.errorText || '#dc3545' }}>You need admin privileges to access these tools.</div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
        <button onClick={() => navigate('/users')} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, padding: '1rem', textAlign: 'left', cursor: 'pointer' }}>
          <div style={{ fontWeight: 600, color: colors.textPrimary }}>Users</div>
          <div style={{ color: colors.textSecondary, fontSize: 13 }}>Manage users and roles</div>
        </button>
        <button onClick={() => navigate('/reports')} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, padding: '1rem', textAlign: 'left', cursor: 'pointer' }}>
          <div style={{ fontWeight: 600, color: colors.textPrimary }}>Reports</div>
          <div style={{ color: colors.textSecondary, fontSize: 13 }}>Moderate reported content</div>
        </button>
        <button onClick={() => navigate('/announcements')} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, padding: '1rem', textAlign: 'left', cursor: 'pointer' }}>
          <div style={{ fontWeight: 600, color: colors.textPrimary }}>Announcements</div>
          <div style={{ color: colors.textSecondary, fontSize: 13 }}>Publish system-wide updates</div>
        </button>
        <button onClick={() => navigate('/create-club')} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, padding: '1rem', textAlign: 'left', cursor: 'pointer' }}>
          <div style={{ fontWeight: 600, color: colors.textPrimary }}>Create Club</div>
          <div style={{ color: colors.textSecondary, fontSize: 13 }}>Add a new club</div>
        </button>
      </div>
    </div>
  );
};

export default AdminDashboardPage;