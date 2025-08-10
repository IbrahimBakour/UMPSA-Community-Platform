import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '../theme';

const DEMO_EVENTS = [
  { id: 1, title: 'Tech Talk: Modern React', date: '2025-08-20', location: 'Auditorium A', club: 'UMPSA Tech Club' },
  { id: 2, title: 'Sports Day Tryouts', date: '2025-08-22', location: 'Main Field', club: 'UMPSA Sports Club' },
  { id: 3, title: 'Art Exhibition', date: '2025-08-30', location: 'Gallery Hall', club: 'UMPSA Arts Club' },
];

const EventsPage = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [events] = useState(DEMO_EVENTS);

  useEffect(() => {
    const stored = localStorage.getItem('userInfo');
    if (!stored) { navigate('/login'); return; }
    setUserInfo(JSON.parse(stored));
  }, [navigate]);

  return (
    <div style={{ padding: '2rem', maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h1 style={{ margin: 0, color: colors.textPrimary }}>Events</h1>
          <p style={{ margin: '6px 0 0', color: colors.textSecondary }}>Upcoming activities across clubs</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {events.map(ev => (
          <div key={ev.id} style={{ background: 'white', border: '1px solid #eee', borderRadius: 8, boxShadow: '0 1px 3px rgba(16,24,40,0.06)', padding: '1rem' }}>
            <div style={{ fontWeight: 600, color: colors.textPrimary }}>{ev.title}</div>
            <div style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4 }}>{new Date(ev.date).toLocaleDateString()}</div>
            <div style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>{ev.location}</div>
            <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 8 }}>Hosted by {ev.club}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={() => alert('RSVP (to be implemented)')} style={{ background: colors.primary, color: 'white', border: 'none', borderRadius: 6, padding: '8px 12px', cursor: 'pointer', fontSize: 12 }}>RSVP</button>
              <button onClick={() => navigate('/clubs')} style={{ background: 'transparent', color: colors.link, border: '1px solid #cbd5e1', borderRadius: 6, padding: '8px 12px', cursor: 'pointer', fontSize: 12 }}>View Clubs</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventsPage;


