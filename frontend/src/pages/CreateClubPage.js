import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '../theme';

const CreateClubPage = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('userInfo');
    if (!stored) { navigate('/login'); return; }
    setUserInfo(JSON.parse(stored));
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;
    alert('Club created (backend later).');
    navigate('/clubs');
  };

  return (
    <div style={{ padding: '2rem', maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ margin: 0, color: colors.textPrimary }}>Create Club Profile</h1>
      <div style={{ height: 10 }} />
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
        <div style={{ display: 'grid', gap: 8 }}>
          <label style={{ fontWeight: 600 }}>Club Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Example" style={{ padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6 }} />
        </div>
        <div style={{ display: 'grid', gap: 8 }}>
          <label style={{ fontWeight: 600 }}>Club Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Club Description" rows={6} style={{ padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6 }} />
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button type="button" onClick={() => navigate(-1)} style={{ background: 'transparent', border: '1px solid #cbd5e1', borderRadius: 6, padding: '10px 16px', cursor: 'pointer' }}>Cancel</button>
          <button type="submit" style={{ background: '#18458B', color: 'white', border: 'none', borderRadius: 6, padding: '10px 16px', cursor: 'pointer' }}>Save</button>
        </div>
      </form>
    </div>
  );
};

export default CreateClubPage;