import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '../theme';

const DEMO_PUBLIC_POSTS = [
  {
    id: 1,
    author: 'Admin',
    authorAvatar: 'https://via.placeholder.com/40/18458B/ffffff?text=A',
    content: 'Welcome to the community platform! Public posts will appear here.',
    timestamp: '2025-08-03T12:00:00Z',
    likes: 24,
    comments: 7,
  },
  {
    id: 2,
    author: 'Student Affairs',
    authorAvatar: 'https://via.placeholder.com/40/00a389/ffffff?text=S',
    content: 'Club Expo this Friday. See you there!',
    timestamp: '2025-08-04T09:00:00Z',
    likes: 12,
    comments: 3,
  },
];

const NewsFeedPage = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [posts, setPosts] = useState(DEMO_PUBLIC_POSTS);
  const [composer, setComposer] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('userInfo');
    if (!stored) { navigate('/login'); return; }
    setUserInfo(JSON.parse(stored));
    // Load persisted public posts
    try {
      const persisted = JSON.parse(localStorage.getItem('publicPosts') || '[]');
      if (Array.isArray(persisted) && persisted.length) {
        // Merge with demo (persisted first)
        setPosts([...persisted, ...DEMO_PUBLIC_POSTS]);
      }
    } catch (_) { /* ignore */ }
  }, [navigate]);

  const isAdmin = userInfo?.role === 'admin';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isAdmin) { alert('Only admins can post publicly.'); return; }
    if (!composer.trim()) return;
    const newPost = {
      id: posts.length + 1,
      author: userInfo?.name || 'Admin',
      authorAvatar: 'https://via.placeholder.com/40/18458B/ffffff?text=A',
      content: composer,
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: 0,
    };
    const next = [newPost, ...posts];
    setPosts(next);
    try {
      const persisted = JSON.parse(localStorage.getItem('publicPosts') || '[]');
      localStorage.setItem('publicPosts', JSON.stringify([newPost, ...persisted]));
    } catch (_) { /* ignore */ }
    setComposer('');
  };

  return (
    <div style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ margin: 0, color: colors.textPrimary }}>News</h1>
      <p style={{ marginTop: 6, color: colors.textSecondary }}>Public posts visible on the main feed</p>

      {/* Composer */}
      <div style={{ background: 'white', borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(16,24,40,0.06)', padding: '1rem', marginTop: '1rem' }}>
        <form onSubmit={handleSubmit}>
          <textarea
            value={composer}
            onChange={(e) => setComposer(e.target.value)}
            placeholder={isAdmin ? 'Share an announcement...' : 'Only admins can post here (request flow later)'}
            rows={3}
            style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: 6 }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
            <div style={{ fontSize: 12, color: colors.textSecondary }}>
              Visibility: Public (global feed)
            </div>
            <button type="submit" disabled={!isAdmin || !composer.trim()} style={{ background: colors.primary, color: 'white', border: 'none', borderRadius: 6, padding: '8px 12px', cursor: isAdmin && composer.trim() ? 'pointer' : 'not-allowed', opacity: isAdmin && composer.trim() ? 1 : 0.6 }}>
              Post
            </button>
          </div>
        </form>
      </div>

      {/* Posts */}
      <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
        {posts.map(p => (
          <div key={p.id} style={{ background: 'white', borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(16,24,40,0.06)', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
              <img src={p.authorAvatar} alt={p.author} style={{ width: 40, height: 40, borderRadius: '50%', marginRight: 10 }} />
              <div>
                <div style={{ fontWeight: 600, color: colors.textPrimary }}>{p.author}</div>
                <div style={{ fontSize: 12, color: colors.textSecondary }}>{new Date(p.timestamp).toLocaleString()}</div>
              </div>
            </div>
            <div style={{ color: colors.textPrimary }}>{p.content}</div>
            <div style={{ display: 'flex', gap: 12, fontSize: 13, color: colors.textSecondary, marginTop: 8 }}>
              <span>👍 {p.likes}</span>
              <span>💬 {p.comments}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsFeedPage;