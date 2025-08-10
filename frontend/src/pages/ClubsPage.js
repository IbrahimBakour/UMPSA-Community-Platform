import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '../theme';

// Demo clubs data
const DEMO_CLUBS = [
  {
    id: 1,
    name: 'UMPSA Tech Club',
    description: 'A community of technology enthusiasts focused on innovation and learning.',
    category: 'Technology',
    members: 45,
    leader: 'Ahmad Tech Leader',
    profilePicture: 'https://via.placeholder.com/150/007bff/ffffff?text=T',
    banner: 'https://via.placeholder.com/800x200/007bff/ffffff?text=Tech+Club+Banner',
    isActive: true,
    createdAt: '2024-01-15'
  },
  {
    id: 2,
    name: 'UMPSA Sports Club',
    description: 'Promoting physical fitness and sportsmanship among students.',
    category: 'Sports',
    members: 78,
    leader: 'Sara Sports Leader',
    profilePicture: 'https://via.placeholder.com/150/28a745/ffffff?text=S',
    banner: 'https://via.placeholder.com/800x200/28a745/ffffff?text=Sports+Club+Banner',
    isActive: true,
    createdAt: '2024-01-10'
  },
  {
    id: 3,
    name: 'UMPSA Arts Club',
    description: 'Celebrating creativity and artistic expression in all forms.',
    category: 'Arts',
    members: 32,
    leader: 'Ali Arts Leader',
    profilePicture: 'https://via.placeholder.com/150/dc3545/ffffff?text=A',
    banner: 'https://via.placeholder.com/800x200/dc3545/ffffff?text=Arts+Club+Banner',
    isActive: true,
    createdAt: '2024-01-20'
  }
];

const ClubsPage = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [clubs, setClubs] = useState(DEMO_CLUBS);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
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

  const filteredClubs = clubs.filter(club => {
    const matchesCategory = selectedCategory === 'all' || club.category === selectedCategory;
    const matchesSearch = club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         club.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ['all', ...new Set(clubs.map(club => club.category))];

  const handleCreateClub = (clubData) => {
    // TODO: Implement club creation API call
    const newClub = {
      id: clubs.length + 1,
      ...clubData,
      members: 0,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setClubs([...clubs, newClub]);
    setShowCreateModal(false);
  };

  const handleClubClick = (clubId) => {
    navigate(`/clubs/${clubId}`);
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

  return (
    <div style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{ 
            margin: 0, 
            color: colors.textPrimary,
            fontSize: '2rem',
            fontWeight: 600
          }}>
            Clubs
          </h1>
          <p style={{ 
            margin: '0.5rem 0 0 0', 
            color: colors.textSecondary,
            fontSize: '1rem'
          }}>
            {userInfo?.role === 'admin' ? 'Manage all clubs and assign leaders' : 
             userInfo?.role === 'club_member' ? 'Browse and join clubs' : 
             'Discover and explore student clubs'}
          </p>
        </div>
        
        {userInfo?.role === 'admin' && (
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              background: colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: 6,
              padding: '10px 20px',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Create New Club
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{
        background: 'white',
        borderRadius: 8,
        padding: '1.5rem',
        marginBottom: '2rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid #eee'
      }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <input
              type="text"
              placeholder="Search clubs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: 4,
                fontSize: 14,
              }}
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: 4,
              fontSize: 14,
              minWidth: 120,
            }}
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Clubs Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', 
        gap: '1.25rem' 
      }}>
        {filteredClubs.map(club => (
          <div
            key={club.id}
            onClick={() => handleClubClick(club.id)}
            style={{
              background: 'white',
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(16,24,40,0.06)',
              border: '1px solid #e9ecef',
              cursor: 'pointer',
              transition: 'transform 0.18s ease, box-shadow 0.18s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(16,24,40,0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(16,24,40,0.06)';
            }}
          >
            {/* Club Banner */}
            <div style={{
              height: 140,
              background: `url(${club.banner}) center/cover no-repeat`,
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                background: 'rgba(0,0,0,0.6)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 500
              }}>
                {club.category}
              </div>
            </div>

            {/* Club Info */}
            <div style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
                <img
                  src={club.profilePicture}
                  alt={club.name}
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: '50%',
                    marginRight: '12px'
                  }}
                />
                <div>
                  <h3 style={{ 
                    margin: 0,
                    color: colors.textPrimary,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                  }}>
                    {club.name}
                  </h3>
                  <p style={{ 
                    margin: '4px 0 0 0',
                    color: colors.textSecondary,
                    fontSize: '0.85rem'
                  }}>
                    {club.members} members
                  </p>
                </div>
              </div>

              <p style={{ 
                color: colors.textSecondary,
                fontSize: '0.9rem',
                lineHeight: 1.45,
                marginBottom: '0.75rem'
              }}>
                {club.description}
              </p>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                fontSize: '0.8rem',
                color: colors.textSecondary
              }}>
                <span>Leader: {club.leader}</span>
                <span>Created: {club.createdAt}</span>
              </div>

              {/* Action Buttons */}
              <div style={{ 
                display: 'flex', 
                gap: '0.5rem',
                marginTop: '0.85rem'
              }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClubClick(club.id);
                  }}
                  style={{
                    background: colors.primary,
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 500,
                    flex: 1
                  }}
                >
                  View Club
                </button>
                
                {userInfo?.role === 'admin' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Navigate to club management
                    }}
                    style={{
                      background: colors.link || '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: 4,
                      padding: '8px 12px',
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: 500,
                    }}
                  >
                    Manage
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredClubs.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: colors.textSecondary
        }}>
          <h3>No clubs found</h3>
          <p>Try adjusting your search or category filters.</p>
        </div>
      )}

      {/* Create Club Modal */}
      {showCreateModal && (
        <CreateClubModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateClub}
        />
      )}
    </div>
  );
};

// Create Club Modal Component
const CreateClubModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    leader: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: 8,
        padding: '2rem',
        maxWidth: 500,
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <h2 style={{ margin: '0 0 1.5rem 0', color: colors.textPrimary }}>
          Create New Club
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              Club Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: 4,
                fontSize: 14,
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
              rows={4}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: 4,
                fontSize: 14,
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              required
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: 4,
                fontSize: 14,
              }}
            >
              <option value="">Select Category</option>
              <option value="Technology">Technology</option>
              <option value="Sports">Sports</option>
              <option value="Arts">Arts</option>
              <option value="Academic">Academic</option>
              <option value="Social">Social</option>
            </select>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              Club Leader
            </label>
            <input
              type="text"
              value={formData.leader}
              onChange={(e) => setFormData({...formData, leader: e.target.value})}
              required
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: 4,
                fontSize: 14,
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                background: colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: 4,
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              Create Club
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClubsPage; 