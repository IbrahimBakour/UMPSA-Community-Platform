import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '../theme';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const storedUserInfo = localStorage.getItem('userInfo');
    if (!storedUserInfo) {
      navigate('/login');
      return;
    }

    try {
      const user = JSON.parse(storedUserInfo);
      setUserInfo(user);
    } catch (error) {
      console.error('Error parsing user info:', error);
      navigate('/login');
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'student':
        return 'Student';
      case 'club_member':
        return 'Club Member';
      case 'admin':
        return 'Administrator';
      default:
        return role;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'student':
        return '#28a745';
      case 'club_member':
        return '#007bff';
      case 'admin':
        return '#dc3545';
      default:
        return colors.textSecondary;
    }
  };

  const getDashboardContent = (role) => {
    switch (role) {
      case 'student':
        return {
          title: 'Student Dashboard',
          description: 'Welcome to your student dashboard. Here you can view clubs, join activities, and manage your profile.',
          features: [
            'Browse available clubs',
            'Join club activities',
            'View your club memberships',
            'Update your profile',
            'View announcements'
          ]
        };
      case 'club_member':
        return {
          title: 'Club Member Dashboard',
          description: 'Welcome to your club member dashboard. Here you can manage your club activities and members.',
          features: [
            'Manage club activities',
            'View club members',
            'Create announcements',
            'Manage club events',
            'View club analytics'
          ]
        };
      case 'admin':
        return {
          title: 'Administrator Dashboard',
          description: 'Welcome to the administrator dashboard. Here you can manage the entire system.',
          features: [
            'Manage all users',
            'Approve club registrations',
            'System analytics',
            'Manage announcements',
            'System settings'
          ]
        };
      default:
        return {
          title: 'Dashboard',
          description: 'Welcome to your dashboard.',
          features: []
        };
    }
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: 18,
        color: colors.textSecondary
      }}>
        Loading...
      </div>
    );
  }

  if (!userInfo) {
    return null;
  }

  const dashboardContent = getDashboardContent(userInfo.role);

  return (
    <div style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid #eee'
      }}>
        <div>
          <h1 style={{ 
            margin: 0, 
            color: colors.textPrimary,
            fontSize: '2rem',
            fontWeight: 600
          }}>
            {dashboardContent.title}
          </h1>
          <p style={{ 
            margin: '0.5rem 0 0 0', 
            color: colors.textSecondary,
            fontSize: '1rem'
          }}>
            {dashboardContent.description}
          </p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            background: colors.errorText || '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          Logout
        </button>
      </div>

      {/* User Info Card */}
      <div style={{
        background: 'white',
        borderRadius: 8,
        padding: '1.5rem',
        marginBottom: '2rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid #eee'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: colors.textPrimary }}>User Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <strong style={{ color: colors.textSecondary }}>Name:</strong>
            <div style={{ color: colors.textPrimary }}>{userInfo.name}</div>
          </div>
          <div>
            <strong style={{ color: colors.textSecondary }}>Email:</strong>
            <div style={{ color: colors.textPrimary }}>{userInfo.email}</div>
          </div>
          <div>
            <strong style={{ color: colors.textSecondary }}>Role:</strong>
            <div style={{ 
              color: 'white', 
              background: getRoleColor(userInfo.role),
              padding: '4px 8px',
              borderRadius: 4,
              display: 'inline-block',
              fontSize: 12,
              fontWeight: 500
            }}>
              {getRoleDisplayName(userInfo.role)}
            </div>
          </div>
          <div>
            <strong style={{ color: colors.textSecondary }}>Login Time:</strong>
            <div style={{ color: colors.textPrimary }}>
              {new Date(userInfo.loginTime).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ margin: '0 0 1rem 0', color: colors.textPrimary }}>Available Features</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1rem' 
        }}>
          {dashboardContent.features.map((feature, index) => (
            <div key={index} style={{
              background: 'white',
              borderRadius: 8,
              padding: '1rem',
              border: '1px solid #eee',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              transition: 'transform 0.2s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              <div style={{ 
                color: colors.primary, 
                fontSize: '1.2rem', 
                marginBottom: '0.5rem' 
              }}>
                {feature}
              </div>
              <div style={{ 
                color: colors.textSecondary, 
                fontSize: '0.9rem' 
              }}>
                Click to access this feature
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{
        background: 'white',
        borderRadius: 8,
        padding: '1.5rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid #eee'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: colors.textPrimary }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button style={{
            background: colors.primary,
            color: 'white',
            border: 'none',
            borderRadius: 6,
            padding: '10px 20px',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 500,
          }}>
            View Profile
          </button>
          <button style={{
            background: colors.link || '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            padding: '10px 20px',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 500,
          }}>
            Browse Clubs
          </button>
          <button style={{
            background: colors.successText || '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            padding: '10px 20px',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 500,
          }}>
            View Announcements
          </button>
        </div>
      </div>
  </div>
);
};

export default Dashboard; 