import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '../theme';

const MyClubsPage = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [myClubs, setMyClubs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (!storedUserInfo) {
      navigate('/login');
      return;
    }
    try {
      const user = JSON.parse(storedUserInfo);
      setUserInfo(user);
      const stored = JSON.parse(localStorage.getItem('userClubs') || '[]');
      setMyClubs(stored);
    } catch (e) {
      console.error('Failed to read user clubs', e);
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const handleOpenClub = (clubId) => {
    navigate(`/clubs/${clubId}`);
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: colors.textSecondary }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, color: colors.textPrimary }}>My Clubs</h1>
          <p style={{ margin: '0.5rem 0 0 0', color: colors.textSecondary }}>
            Clubs you have joined
          </p>
        </div>
        <div>
          <button
            onClick={() => navigate('/clubs')}
            style={{
              background: colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: 6,
              padding: '10px 16px',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Browse Clubs
          </button>
        </div>
      </div>

      {myClubs.length === 0 ? (
        <div style={{
          background: 'white',
          borderRadius: 8,
          padding: '2rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #eee',
          textAlign: 'center'
        }}>
          <h3 style={{ marginTop: 0, color: colors.textPrimary }}>You haven't joined any clubs yet</h3>
          <p style={{ color: colors.textSecondary, marginBottom: '1rem' }}>
            Start by exploring active clubs and joining the ones you like.
          </p>
          <button
            onClick={() => navigate('/clubs')}
            style={{
              background: colors.link || '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              padding: '10px 16px',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Explore Clubs
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {myClubs.map((club) => (
            <div key={club.id} style={{
              background: 'white',
              borderRadius: 8,
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid #eee'
            }}>
              <div style={{ height: 120, background: `url(${club.banner}) center/cover no-repeat` }} />
              <div style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <img src={club.profilePicture} alt={club.name} style={{ width: 40, height: 40, borderRadius: '50%', marginRight: 10 }} />
                  <div>
                    <div style={{ fontWeight: 600, color: colors.textPrimary }}>{club.name}</div>
                    <div style={{ fontSize: 12, color: colors.textSecondary }}>{club.category}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 12, color: colors.textSecondary }}>
                    Leader: {club.leader}
                  </div>
                  <button
                    onClick={() => handleOpenClub(club.id)}
                    style={{
                      background: colors.primary,
                      color: 'white',
                      border: 'none',
                      borderRadius: 4,
                      padding: '6px 12px',
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: 500,
                    }}
                  >
                    Open
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyClubsPage;