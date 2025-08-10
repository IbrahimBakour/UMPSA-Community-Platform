import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '../theme';

const DEMO_ANNOUNCEMENTS = [
  { id: 1, title: 'Orientation Week', body: 'Welcome new students! Check the schedule for activities.', author: 'Admin', createdAt: '2025-08-01T09:00:00Z' },
  { id: 2, title: 'Club Expo', body: 'Visit the main hall this Friday to explore clubs.', author: 'Student Affairs', createdAt: '2025-08-03T10:00:00Z' },
];

const AnnouncementsPage = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [announcements, setAnnouncements] = useState(DEMO_ANNOUNCEMENTS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('userInfo');
    if (!stored) { navigate('/login'); return; }
    try { setUserInfo(JSON.parse(stored)); } finally { setIsLoading(false); }
  }, [navigate]);

  if (isLoading) return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'60vh', color: colors.textSecondary }}>Loading...</div>;

  const canCreate = userInfo?.role === 'admin';

  return (
    <div style={{ padding: '2rem', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '1.25rem' }}>
        <div>
          <h1 style={{ margin: 0, color: colors.textPrimary }}>Announcements</h1>
          <p style={{ margin: '6px 0 0', color: colors.textSecondary }}>System-wide updates and notices</p>
        </div>
        {canCreate && (
          <button
            onClick={() => alert('Create announcement – backend later')}
            style={{ background: colors.primary, color: 'white', border: 'none', borderRadius: 6, padding: '10px 16px', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}
          >
            New Announcement
          </button>
        )}
      </div>

      <div style={{ display:'grid', gap: '1rem' }}>
        {announcements.map(a => (
          <div key={a.id} style={{ background: 'white', border: '1px solid #eee', borderRadius: 8, padding: '1rem', boxShadow: '0 1px 3px rgba(16,24,40,0.06)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <h3 style={{ margin: 0, color: colors.textPrimary }}>{a.title}</h3>
              <div style={{ fontSize: 12, color: colors.textSecondary }}>{new Date(a.createdAt).toLocaleString()}</div>
            </div>
            <p style={{ color: colors.textPrimary, margin: '0.5rem 0 0' }}>{a.body}</p>
            <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 6 }}>By {a.author}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnnouncementsPage;