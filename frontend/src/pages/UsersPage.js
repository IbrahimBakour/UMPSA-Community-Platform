import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '../theme';

const DEMO_USERS = [
  { id: 1, name: 'Ahmad Student', email: 'student@umpsa.edu.my', role: 'student' },
  { id: 2, name: 'Sara Club Member', email: 'club@umpsa.edu.my', role: 'club_member' },
  { id: 3, name: 'Admin User', email: 'admin@umpsa.edu.my', role: 'admin' },
];

const RoleBadge = ({ role }) => {
  const map = { student: '#28a745', club_member: '#007bff', admin: '#dc3545' };
  const label = role === 'club_member' ? 'Club Member' : role.charAt(0).toUpperCase() + role.slice(1);
  return <span style={{ background: map[role] || '#6c757d', color: 'white', padding: '2px 8px', borderRadius: 999, fontSize: 12 }}>{label}</span>;
};

const UsersPage = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [users, setUsers] = useState(DEMO_USERS);

  useEffect(() => {
    const stored = localStorage.getItem('userInfo');
    if (!stored) { navigate('/login'); return; }
    setUserInfo(JSON.parse(stored));
  }, [navigate]);

  return (
    <div style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto' }}>
      <h1 style={{ margin: 0, color: colors.textPrimary }}>Users</h1>
      <p style={{ color: colors.textSecondary, marginTop: 6 }}>User management (admin)</p>

      <div style={{ marginTop: '1rem', background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 80px', padding: '12px 16px', borderBottom: '1px solid #e5e7eb', background: '#f8fafc', fontWeight: 600 }}>
          <div>Name</div>
          <div>Email</div>
          <div>Role</div>
          <div></div>
        </div>
        {users.map(u => (
          <div key={u.id} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 80px', padding: '14px 16px', borderBottom: '1px solid #f1f5f9', alignItems: 'center' }}>
            <div style={{ color: colors.textPrimary }}>{u.name}</div>
            <div style={{ color: colors.textSecondary }}>{u.email}</div>
            <div><RoleBadge role={u.role} /></div>
            <div>
              <button onClick={() => alert('Edit role – backend later')} style={{ background: 'transparent', border: '1px solid #cbd5e1', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontSize: 12 }}>Edit</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsersPage;