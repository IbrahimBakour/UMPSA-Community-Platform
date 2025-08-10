import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '../theme';

const DEMO_REPORTS = [
  { id: 1, reason: 'Spam post', description: 'Repeated promotional content', status: 'closed' },
  { id: 2, reason: 'Harassment', description: 'Inappropriate comments', status: 'pending' },
  { id: 3, reason: 'Offensive content', description: 'Hate speech in post', status: 'rejected' },
];

const StatusChip = ({ status }) => {
  const map = {
    closed: { color: '#10b981', label: 'Closed' },
    pending: { color: '#f59e0b', label: 'Pending' },
    rejected: { color: '#ef4444', label: 'Rejected' },
  };
  const s = map[status] || { color: colors.textSecondary, label: status };
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />
      <span style={{ color: colors.textPrimary, fontSize: 14 }}>{s.label}</span>
    </div>
  );
};

const ReportsPage = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [reports, setReports] = useState(DEMO_REPORTS);
  const [postRequests, setPostRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('userInfo');
    if (!stored) { navigate('/login'); return; }
    try {
      setUserInfo(JSON.parse(stored));
      const queued = JSON.parse(localStorage.getItem('publicPostRequests') || '[]');
      setPostRequests(queued);
    } finally { setIsLoading(false); }
  }, [navigate]);

  if (isLoading) return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'60vh', color: colors.textSecondary }}>Loading...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto' }}>
      <h1 style={{ margin: 0, color: colors.textPrimary }}>Reports</h1>
      <p style={{ color: colors.textSecondary, marginTop: 6 }}>Moderation queue for reported content</p>

      {/* Public Post Requests */}
      {postRequests.length > 0 && (
        <div style={{ marginTop: '1rem', background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', background: '#f8fafc', fontWeight: 600 }}>Public Post Requests</div>
          {postRequests.map(req => (
            <div key={req.id} style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 4 }}>{new Date(req.createdAt).toLocaleString()} • {req.requestedBy}</div>
              <div style={{ fontWeight: 600, color: colors.textPrimary }}>{req.clubName}</div>
              <div style={{ marginTop: 6, color: colors.textPrimary }}>{req.content}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button onClick={() => {
                  // Approve: add to public posts
                  const post = {
                    id: `pub_${Date.now()}`,
                    author: `${req.clubName} (Approved)`,
                    authorAvatar: 'https://via.placeholder.com/40/0ea5e9/ffffff?text=C',
                    content: req.content,
                    timestamp: new Date().toISOString(), likes: 0, comments: 0
                  };
                  try {
                    const existing = JSON.parse(localStorage.getItem('publicPosts') || '[]');
                    localStorage.setItem('publicPosts', JSON.stringify([post, ...existing]));
                    const remaining = postRequests.filter(r => r.id !== req.id);
                    setPostRequests(remaining);
                    localStorage.setItem('publicPostRequests', JSON.stringify(remaining));
                    alert('Approved and published to News.');
                  } catch (_) {}
                }} style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontSize: 12 }}>Approve</button>
                <button onClick={() => {
                  const remaining = postRequests.filter(r => r.id !== req.id);
                  setPostRequests(remaining);
                  localStorage.setItem('publicPostRequests', JSON.stringify(remaining));
                  alert('Request rejected.');
                }} style={{ background: '#dc2626', color: 'white', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontSize: 12 }}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '1rem', background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 60px', padding: '12px 16px', borderBottom: '1px solid #e5e7eb', background: '#f8fafc', fontWeight: 600 }}>
          <div>Report Reason</div>
          <div>Report Description</div>
          <div>Status</div>
          <div></div>
        </div>
        {reports.map(r => (
          <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 60px', padding: '14px 16px', borderBottom: '1px solid #f1f5f9', alignItems: 'center' }}>
            <div style={{ color: colors.textPrimary }}>{r.reason}</div>
            <div style={{ color: colors.textSecondary }}>{r.description}</div>
            <div><StatusChip status={r.status} /></div>
            <div>
              <button onClick={() => alert('Delete - backend later')} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportsPage;