import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '../theme';

const getStoredProfiles = () => {
  try {
    const raw = localStorage.getItem('userProfiles') || '{}';
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch (_) {
    return {};
  }
};

const setStoredProfiles = (profilesObj) => {
  try {
    localStorage.setItem('userProfiles', JSON.stringify(profilesObj));
  } catch (_) {
    // ignore
  }
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    role: '',
    phone: '',
    location: '',
    bio: '',
    avatarUrl: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('userInfo');
    if (!stored) {
      navigate('/login');
      return;
    }
    try {
      const u = JSON.parse(stored);
      setUserInfo(u);
      const profiles = getStoredProfiles();
      const existing = profiles[u.email];
      const initial = existing || {
        name: u.name || '',
        email: u.email || '',
        role: u.role || '',
        phone: '',
        location: '',
        bio: '',
        avatarUrl: ''
      };
      setProfile(initial);
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const roleBadgeColor = useMemo(() => {
    switch (profile.role) {
      case 'student':
        return '#28a745';
      case 'club_member':
        return '#007bff';
      case 'admin':
        return '#dc3545';
      default:
        return colors.textSecondary;
    }
  }, [profile.role]);

  const handleChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');
    try {
      const profiles = getStoredProfiles();
      profiles[profile.email] = profile;
      setStoredProfiles(profiles);
      // Keep header/user context in sync if name changed
      try {
        const stored = JSON.parse(localStorage.getItem('userInfo') || '{}');
        if (stored && stored.email === profile.email) {
          const next = { ...stored, name: profile.name };
          localStorage.setItem('userInfo', JSON.stringify(next));
        }
      } catch (_) {}
      setMessage('Profile saved successfully.');
    } catch (err) {
      setMessage('Failed to save profile.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: colors.textSecondary }}>
        Loading...
      </div>
    );
  }

  if (!userInfo) return null;

  return (
    <div style={{ padding: '2rem', maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative' }}>
          <img
            src={profile.avatarUrl || 'https://via.placeholder.com/96/0ea5e9/ffffff?text=U'}
            alt={profile.name}
            style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', border: '3px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
          />
        </div>
        <div style={{ flex: 1, minWidth: 260 }}>
          <h1 style={{ margin: 0, color: colors.textPrimary }}>{profile.name || 'Your Name'}</h1>
          <div style={{ color: colors.textSecondary, marginTop: 4 }}>{profile.email}</div>
          <div style={{ display: 'inline-block', background: roleBadgeColor, color: 'white', padding: '2px 8px', borderRadius: 999, fontSize: 12, fontWeight: 600, marginTop: 8 }}>
            {profile.role === 'club_member' ? 'Club Member' : (profile.role?.charAt(0).toUpperCase() + profile.role?.slice(1))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => navigate('/change-password')}
            style={{ background: 'transparent', color: colors.link, border: '1px solid #cbd5e1', borderRadius: 6, padding: '10px 16px', cursor: 'pointer' }}
          >
            Change Password
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.25rem' }}>
        {/* Left: Edit Form */}
        <form onSubmit={handleSave} style={{ background: 'white', border: '1px solid #eee', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: '1.25rem' }}>
          <h3 style={{ marginTop: 0, color: colors.textPrimary }}>Profile Details</h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6, color: colors.textSecondary }}>Full Name</label>
              <input
                value={profile.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Your name"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, color: colors.textSecondary }}>Email</label>
              <input value={profile.email} readOnly style={{ width: '100%', padding: '10px 12px', border: '1px solid #eee', borderRadius: 6, background: '#f8f9fa', color: colors.textSecondary }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, color: colors.textSecondary }}>Avatar URL</label>
              <input
                value={profile.avatarUrl}
                onChange={(e) => handleChange('avatarUrl', e.target.value)}
                placeholder="https://..."
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, color: colors.textSecondary }}>Phone</label>
              <input
                value={profile.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="e.g., +60 12-345 6789"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, color: colors.textSecondary }}>Location</label>
              <input
                value={profile.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="Campus / Building"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, color: colors.textSecondary }}>Bio</label>
              <textarea
                value={profile.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                rows={5}
                placeholder="Tell us about yourself..."
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6, resize: 'vertical' }}
              />
            </div>
          </div>
          {message && (
            <div style={{ marginTop: 12, color: message.includes('successfully') ? (colors.successText || '#28a745') : colors.errorText, background: message.includes('successfully') ? (colors.successBg || '#d4edda') : colors.errorBg, borderRadius: 6, padding: '8px 12px' }}>
              {message}
            </div>
          )}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 14 }}>
            <button type="button" onClick={() => navigate(-1)} style={{ background: 'transparent', border: '1px solid #cbd5e1', borderRadius: 6, padding: '10px 16px', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={isSaving} style={{ background: colors.primary, color: 'white', border: 'none', borderRadius: 6, padding: '10px 16px', cursor: isSaving ? 'not-allowed' : 'pointer' }}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>

        {/* Right: Summary / Quick Info */}
        <div style={{ background: 'white', border: '1px solid #eee', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: '1.25rem' }}>
          <h3 style={{ marginTop: 0, color: colors.textPrimary }}>Profile Summary</h3>
          <div style={{ display: 'grid', gap: 10 }}>
            <div>
              <strong style={{ color: colors.textSecondary }}>Role:</strong>
              <div style={{ color: colors.textPrimary }}>{profile.role === 'club_member' ? 'Club Member' : (profile.role?.charAt(0).toUpperCase() + profile.role?.slice(1))}</div>
            </div>
            {profile.phone && (
              <div>
                <strong style={{ color: colors.textSecondary }}>Phone:</strong>
                <div style={{ color: colors.textPrimary }}>{profile.phone}</div>
              </div>
            )}
            {profile.location && (
              <div>
                <strong style={{ color: colors.textSecondary }}>Location:</strong>
                <div style={{ color: colors.textPrimary }}>{profile.location}</div>
              </div>
            )}
            {profile.bio && (
              <div>
                <strong style={{ color: colors.textSecondary }}>Bio:</strong>
                <div style={{ color: colors.textPrimary, whiteSpace: 'pre-wrap' }}>{profile.bio}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;


