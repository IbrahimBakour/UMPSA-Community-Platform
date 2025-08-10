import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { colors } from '../theme';

const Header = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      try {
        const user = JSON.parse(storedUserInfo);
        setUserInfo(user);
      } catch (error) {
        console.error('Error parsing user info:', error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    setUserInfo(null);
    navigate('/login');
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'student':
        return 'Student';
      case 'club_member':
        return 'Club Member';
      case 'admin':
        return 'Admin';
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

  const getRoleBasedNav = (role) => {
    const baseNav = [
      { to: '/dashboard', label: 'Dashboard' },
      { to: '/clubs', label: 'Clubs' }
    ];

    switch (role) {
      case 'admin':
        return [
          ...baseNav,
          { to: '/users', label: 'Users' },
          { to: '/announcements', label: 'Announcements' },
          { to: '/settings', label: 'Settings' }
        ];
      case 'club_member':
        return [
          ...baseNav,
          { to: '/my-clubs', label: 'My Clubs' },
          { to: '/events', label: 'Events' }
        ];
      case 'student':
        return [
          ...baseNav,
          { to: '/my-memberships', label: 'My Memberships' },
          { to: '/announcements', label: 'Announcements' }
        ];
      default:
        return baseNav;
    }
  };

  return (
    <nav style={{ 
      background: colors.headerBg, 
      color: colors.headerText, 
      padding: '1rem', 
      boxShadow: '0 2px 8px #eee', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between' 
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img 
          src={process.env.PUBLIC_URL + '/UMPSA Logo.png'} 
          alt="UMPSA Logo" 
          style={{ height: 40, marginRight: 16 }} 
        />
        <span style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>UCP</span>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Navigation Links */}
        {userInfo ? (
          getRoleBasedNav(userInfo.role).map((navItem, index) => (
            <Link 
              key={index}
              to={navItem.to} 
              style={{ 
                color: colors.link, 
                textDecoration: 'none',
                padding: '8px 12px',
                borderRadius: 4,
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              {navItem.label}
            </Link>
          ))
        ) : (
          <>
            <Link to="/login" style={{ color: colors.link, textDecoration: 'none' }}>Login</Link>
          </>
        )}

        {/* User Menu */}
        {userInfo && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{
                background: 'transparent',
                border: 'none',
                color: colors.headerText,
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: 14,
              }}
            >
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: getRoleColor(userInfo.role),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: 12,
                fontWeight: 'bold'
              }}>
                {userInfo.name.charAt(0).toUpperCase()}
              </div>
              <span>{userInfo.name}</span>
              <span style={{ fontSize: 10 }}>▼</span>
            </button>

            {showUserMenu && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                background: 'white',
                borderRadius: 8,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                border: '1px solid #eee',
                minWidth: 200,
                zIndex: 1000,
                marginTop: '4px'
              }}>
                <div style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #eee',
                  background: '#f8f9fa'
                }}>
                  <div style={{ fontWeight: 600, color: colors.textPrimary }}>
                    {userInfo.name}
                  </div>
                  <div style={{ 
                    fontSize: 12, 
                    color: colors.textSecondary,
                    marginTop: 4
                  }}>
                    {userInfo.email}
                  </div>
                  <div style={{
                    display: 'inline-block',
                    background: getRoleColor(userInfo.role),
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: 4,
                    fontSize: 10,
                    fontWeight: 500,
                    marginTop: 4
                  }}>
                    {getRoleDisplayName(userInfo.role)}
                  </div>
                </div>
                
                <div style={{ padding: '8px 0' }}>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/profile');
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      background: 'transparent',
                      border: 'none',
                      padding: '8px 16px',
                      cursor: 'pointer',
                      fontSize: 14,
                      color: colors.textPrimary,
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/settings');
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      background: 'transparent',
                      border: 'none',
                      padding: '8px 16px',
                      cursor: 'pointer',
                      fontSize: 14,
                      color: colors.textPrimary,
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      background: 'transparent',
                      border: 'none',
                      padding: '8px 16px',
                      cursor: 'pointer',
                      fontSize: 14,
                      color: colors.errorText || '#dc3545',
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Header; 