import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '../theme';

const SubmitReportPage = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('userInfo');
    if (!stored) { navigate('/login'); return; }
    setUserInfo(JSON.parse(stored));
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim() || !description.trim()) {
      setError('Please fill in both reason and description.');
      return;
    }
    setError('');
    setIsSubmitting(true);

    // Build report object
    const newReport = {
      id: `rep_${Date.now()}`,
      reason: reason.trim(),
      description: description.trim(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      submittedBy: {
        name: userInfo?.name,
        email: userInfo?.email,
        role: userInfo?.role,
      },
    };

    try {
      const existing = JSON.parse(localStorage.getItem('reports') || '[]');
      localStorage.setItem('reports', JSON.stringify([newReport, ...existing]));
      navigate('/reports');
    } catch (_) {
      setError('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ margin: 0, color: colors.textPrimary }}>Submit Report</h1>
      <p style={{ marginTop: 6, color: colors.textSecondary }}>Help us keep the community safe</p>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
        <div style={{ display: 'grid', gap: 8 }}>
          <label style={{ fontWeight: 500 }}>Report Reason</label>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason"
            style={{ padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6 }}
          />
        </div>
        <div style={{ display: 'grid', gap: 8 }}>
          <label style={{ fontWeight: 500 }}>Report Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue"
            rows={6}
            style={{ padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6 }}
          />
        </div>
        {error && (
          <div style={{ color: colors.errorText || '#dc3545', background: colors.errorBg || '#fde2e2', padding: '8px 12px', borderRadius: 6 }}>
            {error}
          </div>
        )}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{ background: 'transparent', border: '1px solid #cbd5e1', borderRadius: 6, padding: '10px 16px', cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{ background: colors.primary, color: 'white', border: 'none', borderRadius: 6, padding: '10px 16px', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubmitReportPage;