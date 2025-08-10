import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { colors } from '../theme';

// Demo club data
const DEMO_CLUB = {
  id: 1,
  name: 'UMPSA Tech Club',
  description: 'A community of technology enthusiasts focused on innovation and learning. We organize workshops, hackathons, and networking events to help students develop their technical skills and connect with industry professionals.',
  category: 'Technology',
  members: 45,
  leader: 'Ahmad Tech Leader',
  profilePicture: 'https://via.placeholder.com/150/007bff/ffffff?text=T',
  banner: 'https://via.placeholder.com/800x200/007bff/ffffff?text=Tech+Club+Banner',
  isActive: true,
  createdAt: '2024-01-15',
  contact: {
    email: 'techclub@umpsa.edu.my',
    phone: '+60 12-345 6789',
    location: 'Computer Science Building, Room 101'
  },
  membersList: [
    { id: 1, name: 'Ahmad Tech Leader', role: 'leader', avatar: 'https://via.placeholder.com/40/007bff/ffffff?text=A', joinedAt: '2024-01-15' },
    { id: 2, name: 'Sara Developer', role: 'member', avatar: 'https://via.placeholder.com/40/28a745/ffffff?text=S', joinedAt: '2024-01-20' },
    { id: 3, name: 'Ali Programmer', role: 'member', avatar: 'https://via.placeholder.com/40/dc3545/ffffff?text=A', joinedAt: '2024-01-25' },
    { id: 4, name: 'Fatima Designer', role: 'member', avatar: 'https://via.placeholder.com/40/ffc107/ffffff?text=F', joinedAt: '2024-02-01' },
    { id: 5, name: 'Omar Engineer', role: 'member', avatar: 'https://via.placeholder.com/40/6f42c1/ffffff?text=O', joinedAt: '2024-02-05' }
  ],
  posts: [
    {
      id: 1,
      author: 'Ahmad Tech Leader',
      authorAvatar: 'https://via.placeholder.com/40/007bff/ffffff?text=A',
      content: 'Great workshop today! Thanks to everyone who participated in our React.js session. Next week we\'ll be covering Node.js backend development.',
      timestamp: '2024-02-15T10:30:00',
      likes: 12,
      comments: 5
    },
    {
      id: 2,
      author: 'Sara Developer',
      authorAvatar: 'https://via.placeholder.com/40/28a745/ffffff?text=S',
      content: 'Just finished the hackathon project! Can\'t wait to present it to the club. The experience was amazing!',
      timestamp: '2024-02-14T15:45:00',
      likes: 8,
      comments: 3
    },
    {
      id: 3,
      author: 'Ali Programmer',
      authorAvatar: 'https://via.placeholder.com/40/dc3545/ffffff?text=A',
      content: 'Anyone interested in forming a study group for the upcoming programming competition?',
      timestamp: '2024-02-13T09:15:00',
      likes: 6,
      comments: 4
    }
  ]
};

// Demo users list (to simulate directory for adding members)
const DEMO_USERS = [
  { id: 'u1', name: 'Ahmad Tech Leader', email: 'ahmad.leader@umpsa.edu.my', role: 'club_member', avatar: './logo.svg' },
  { id: 'u2', name: 'Sara Developer', email: 'sara.dev@umpsa.edu.my', role: 'student', avatar: 'https://via.placeholder.com/40/28a745/ffffff?text=S' },
  { id: 'u3', name: 'Ali Programmer', email: 'ali.prog@umpsa.edu.my', role: 'student', avatar: 'https://via.placeholder.com/40/dc3545/ffffff?text=A' },
  { id: 'u4', name: 'Fatima Designer', email: 'fatima.design@umpsa.edu.my', role: 'student', avatar: 'https://via.placeholder.com/40/ffc107/ffffff?text=F' },
  { id: 'u5', name: 'Omar Engineer', email: 'omar.eng@umpsa.edu.my', role: 'club_member', avatar: 'https://via.placeholder.com/40/6f42c1/ffffff?text=O' },
  { id: 'u6', name: 'Zara Analyst', email: 'zara.analyst@umpsa.edu.my', role: 'student', avatar: 'https://via.placeholder.com/40/20c997/ffffff?text=Z' },
  { id: 'u7', name: 'Hassan QA', email: 'hassan.qa@umpsa.edu.my', role: 'student', avatar: 'https://via.placeholder.com/40/0dcaf0/ffffff?text=H' },
  { id: 'u8', name: 'Noor PM', email: 'noor.pm@umpsa.edu.my', role: 'club_member', avatar: 'https://via.placeholder.com/40/f06595/ffffff?text=N' }
];

const ClubDetailPage = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [club, setClub] = useState(DEMO_CLUB);
  const [activeTab, setActiveTab] = useState('background');
  const [isLoading, setIsLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [isLeader, setIsLeader] = useState(false);
  const [newPost, setNewPost] = useState('');
  const [showEditClubModal, setShowEditClubModal] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');

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
      
      // Check if user is a member or leader of this club
      const member = club.membersList.find(m => m.name === user.name);
      setIsMember(!!member);
      setIsLeader(member?.role === 'leader');
      
    } catch (error) {
      console.error('Error parsing user info:', error);
      navigate('/login');
    } finally {
      setIsLoading(false);
    }
  }, [navigate, club.membersList]);

  const userCanManage = Boolean(userInfo && (userInfo.role === 'admin' || isLeader));

  const handleAddMember = (e) => {
    e?.preventDefault?.();
    // no-op: retained for compatibility
  };

  const isAlreadyMember = (user) =>
    club.membersList.some(m => (m.email && user.email && m.email === user.email) || m.name === user.name);

  const handleAddMemberByUser = (user) => {
    if (!user || isAlreadyMember(user)) return;
    const newMember = {
      id: club.membersList.length + 1,
      name: user.name,
      email: user.email,
      role: 'member',
      avatar: user.avatar || `https://via.placeholder.com/40/${Math.floor(Math.random()*16777215).toString(16)}/ffffff?text=${user.name.charAt(0).toUpperCase()}`,
      joinedAt: new Date().toISOString().split('T')[0]
    };
    setClub({
      ...club,
      members: club.members + 1,
      membersList: [...club.membersList, newMember]
    });
  };

  const handleRemoveMember = (memberId) => {
    const memberToRemove = club.membersList.find(m => m.id === memberId);
    if (!memberToRemove) return;
    // Prevent leader from being removed by non-admin
    if (memberToRemove.role === 'leader' && userInfo?.role !== 'admin') return;
    setClub({
      ...club,
      members: Math.max(0, club.members - 1),
      membersList: club.membersList.filter(m => m.id !== memberId)
    });
    if (memberToRemove.name === userInfo?.name) {
      setIsMember(false);
      setIsLeader(false);
    }
  };

  const handlePromoteToLeader = (memberId) => {
    if (userInfo?.role !== 'admin') return; // Only admin can change leader
    const member = club.membersList.find(m => m.id === memberId);
    if (!member) return;
    const updatedMembers = club.membersList.map(m => ({
      ...m,
      role: m.id === memberId ? 'leader' : 'member'
    }));
    setClub({
      ...club,
      leader: member.name,
      membersList: updatedMembers
    });
    if (member.name === userInfo?.name) {
      setIsLeader(true);
    } else if (isLeader) {
      setIsLeader(false);
    }
  };

  const handleJoinClub = () => {
    // TODO: Implement join club API call
    setIsMember(true);
    // Add user to members list
    const newMember = {
      id: club.membersList.length + 1,
      name: userInfo.name,
      role: 'member',
      avatar: `https://via.placeholder.com/40/${Math.floor(Math.random()*16777215).toString(16)}/ffffff?text=${userInfo.name.charAt(0)}`,
      joinedAt: new Date().toISOString().split('T')[0]
    };
    setClub({
      ...club,
      members: club.members + 1,
      membersList: [...club.membersList, newMember]
    });

    // Persist membership for My Clubs page
    try {
      const stored = JSON.parse(localStorage.getItem('userClubs') || '[]');
      if (!stored.some(c => String(c.id) === String(club.id))) {
        const minimalClub = {
          id: club.id,
          name: club.name,
          profilePicture: club.profilePicture,
          banner: club.banner,
          category: club.category,
          leader: club.leader,
          joinedAt: new Date().toISOString()
        };
        localStorage.setItem('userClubs', JSON.stringify([minimalClub, ...stored]));
      }
    } catch (_) {
      // ignore
    }
  };

  const handleLeaveClub = () => {
    // TODO: Implement leave club API call
    setIsMember(false);
    setClub({
      ...club,
      members: club.members - 1,
      membersList: club.membersList.filter(m => m.name !== userInfo.name)
    });

    // Remove from persisted memberships
    try {
      const stored = JSON.parse(localStorage.getItem('userClubs') || '[]');
      const next = stored.filter(c => String(c.id) !== String(club.id));
      localStorage.setItem('userClubs', JSON.stringify(next));
    } catch (_) {
      // ignore
    }
  };

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    const post = {
      id: club.posts.length + 1,
      author: userInfo.name,
      authorAvatar: `https://via.placeholder.com/40/${Math.floor(Math.random()*16777215).toString(16)}/ffffff?text=${userInfo.name.charAt(0)}`,
      content: newPost,
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: 0
    };

    setClub({
      ...club,
      posts: [post, ...club.posts]
    });
    setNewPost('');
  };

  const handleSaveClub = (updatedFields) => {
    setClub((prev) => ({
      ...prev,
      ...updatedFields,
    }));
    setShowEditClubModal(false);
  };

  const tabs = [
    { id: 'background', label: 'Background' },
    { id: 'members', label: 'Members' },
    { id: 'news', label: 'News' },
    { id: 'contact', label: 'Contact' }
  ];

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
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Club Banner */}
      <div style={{
        height: 200,
        background: `url(${club.banner}) center/cover no-repeat`,
        position: 'relative',
        borderRadius: '0 0 8px 8px'
      }}>
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          right: '20px',
          display: 'flex',
          alignItems: 'flex-end',
          gap: '20px'
        }}>
          <img
            src={club.profilePicture}
            alt={club.name}
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              border: '4px solid white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}
          />
          <div style={{ color: 'white', flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 600 }}>
              {club.name}
            </h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '1rem', opacity: 0.9 }}>
              {club.category} • {club.members} members
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {!isMember ? (
              <button
                onClick={handleJoinClub}
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
                Join Club
              </button>
            ) : (
              <button
                onClick={handleLeaveClub}
                style={{
                  background: colors.errorText || '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  padding: '10px 20px',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                Leave Club
              </button>
            )}
            {userCanManage && (
              <button
                onClick={() => setShowEditClubModal(true)}
                style={{
                  background: colors.link || '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  padding: '10px 20px',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                Edit Club
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #eee',
        marginTop: '20px'
      }}>
        <div style={{
          display: 'flex',
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 20px'
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '14px 18px',
                cursor: 'pointer',
                fontSize: 15,
                fontWeight: activeTab === tab.id ? 600 : 500,
                color: activeTab === tab.id ? colors.textPrimary : colors.textSecondary,
                borderBottom: activeTab === tab.id ? `2px solid ${colors.textPrimary}` : '2px solid transparent',
                transition: 'all 0.2s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div style={{ padding: '20px' }}>
        {activeTab === 'background' && (
          <div style={{
            background: 'white',
            borderRadius: 8,
            padding: '2rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #eee'
          }}>
            <h2 style={{ margin: '0 0 1rem 0', color: colors.textPrimary }}>
              About {club.name}
            </h2>
            <p style={{ 
              color: colors.textSecondary,
              lineHeight: 1.6,
              fontSize: '1rem',
              marginBottom: '2rem'
            }}>
              {club.description}
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <strong style={{ color: colors.textSecondary }}>Category:</strong>
                <div style={{ color: colors.textPrimary }}>{club.category}</div>
              </div>
              <div>
                <strong style={{ color: colors.textSecondary }}>Leader:</strong>
                <div style={{ color: colors.textPrimary }}>{club.leader}</div>
              </div>
              <div>
                <strong style={{ color: colors.textSecondary }}>Members:</strong>
                <div style={{ color: colors.textPrimary }}>{club.members}</div>
              </div>
              <div>
                <strong style={{ color: colors.textSecondary }}>Created:</strong>
                <div style={{ color: colors.textPrimary }}>{club.createdAt}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div style={{
            background: 'white',
            borderRadius: 8,
            padding: '2rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #eee'
          }}>
            <h2 style={{ margin: '0 0 1rem 0', color: colors.textPrimary }}>
              Club Members ({club.membersList.length})
            </h2>
            {userCanManage && (
              <div style={{
                border: '1px dashed #ccc',
                borderRadius: 8,
                padding: '1rem',
                background: '#f8f9fa',
                marginBottom: '1.5rem'
              }}>
                <div style={{ fontWeight: 600, marginBottom: 8, color: colors.textPrimary }}>Add Member</div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                  <input
                    type="text"
                    placeholder="Search users by name or email"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    style={{
                      flex: 1,
                      minWidth: 260,
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      borderRadius: 4,
                      fontSize: 14
                    }}
                  />
                </div>
                <div style={{
                  maxHeight: 240,
                  overflowY: 'auto',
                  background: 'white',
                  border: '1px solid #eee',
                  borderRadius: 6
                }}>
                  {DEMO_USERS
                    .filter(u => !isAlreadyMember(u))
                    .filter(u => {
                      const q = userSearchQuery.trim().toLowerCase();
                      if (!q) return true;
                      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
                    })
                    .slice(0, 20)
                    .map(u => (
                      <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.8rem', borderBottom: '1px solid #f1f3f5' }}>
                        <img src={u.avatar} alt={u.name} style={{ width: 32, height: 32, borderRadius: '50%' }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 500, color: colors.textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name}</div>
                          <div style={{ fontSize: 12, color: colors.textSecondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email}</div>
                        </div>
                        <button
                          onClick={() => handleAddMemberByUser(u)}
                          style={{
                            background: colors.primary,
                            color: 'white',
                            border: 'none',
                            borderRadius: 4,
                            padding: '6px 10px',
                            cursor: 'pointer',
                            fontSize: 12
                          }}
                        >
                          Add
                        </button>
                      </div>
                    ))}
                  {DEMO_USERS.filter(u => !isAlreadyMember(u)).filter(u => {
                    const q = userSearchQuery.trim().toLowerCase();
                    if (!q) return true;
                    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
                  }).length === 0 && (
                    <div style={{ padding: '1rem', textAlign: 'center', color: colors.textSecondary }}>
                      No users found.
                    </div>
                  )}
                </div>
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem' }}>
              {club.membersList.map(member => (
                <div key={member.id} style={{
                  background: '#ffffff',
                  border: '1px solid #eee',
                  borderRadius: 8,
                  padding: '1rem',
                  textAlign: 'center'
                }}>
                  <img
                    src={member.avatar}
                    alt={member.name}
                    style={{ width: 72, height: 72, borderRadius: '50%', background: '#eee' }}
                  />
                  <div style={{ fontWeight: 600, color: colors.textPrimary, marginTop: 8 }}>{member.name}</div>
                  <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                    {member.role === 'leader' ? 'Club Leader' : 'Member'}
                  </div>
                  <div style={{ fontSize: 11, color: colors.textSecondary, marginTop: 2 }}>Joined {member.joinedAt}</div>
                  {member.role === 'leader' && (
                    <div style={{
                      display: 'inline-block',
                      background: colors.primary,
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 600,
                      marginTop: 8
                    }}>
                      Leader
                    </div>
                  )}
                  {userCanManage && (
                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', marginTop: 10 }}>
                      {userInfo?.role === 'admin' && member.role !== 'leader' && (
                        <button
                          onClick={() => handlePromoteToLeader(member.id)}
                          style={{
                            background: '#6f42c1',
                            color: 'white',
                            border: 'none',
                            borderRadius: 4,
                            padding: '6px 8px',
                            cursor: 'pointer',
                            fontSize: 12
                          }}
                          title="Set as Leader (Admin only)"
                        >
                          Promote
                        </button>
                      )}
                      {(userInfo?.role === 'admin' || (isLeader && member.role !== 'leader')) && (
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          style={{
                            background: colors.errorText || '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: 4,
                            padding: '6px 8px',
                            cursor: 'pointer',
                            fontSize: 12
                          }}
                          title="Remove from club"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

                 {activeTab === 'news' && (
           <div>
             {/* Create Post (Members Only) */}
             {isMember && (
               <div style={{
                 background: 'white',
                 borderRadius: 8,
                 padding: '1.5rem',
                 marginBottom: '2rem',
                 boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                 border: '1px solid #eee'
               }}>
                                   <h3 style={{ margin: '0 0 1rem 0', color: colors.textPrimary }}>
                    Share a Club Post
                  </h3>
                  <p style={{ 
                    color: colors.textSecondary, 
                    fontSize: '0.9rem', 
                    marginBottom: '1rem',
                    fontStyle: 'italic'
                  }}>
                    Club posts are visible to all users but only displayed on this club's page.
                  </p>
                  <form onSubmit={handleCreatePost}>
                    <textarea
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      placeholder="Share something with the club..."
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #ddd',
                        borderRadius: 4,
                        fontSize: 14,
                        resize: 'vertical',
                        marginBottom: '1rem'
                      }}
                    />
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
                      <button type="button" disabled title="Photo (coming soon)" style={{ background: 'transparent', border: '1px solid #ddd', borderRadius: 4, padding: '6px 10px', fontSize: 12, color: '#888' }}>📷 Photo</button>
                      <button type="button" disabled title="Video (coming soon)" style={{ background: 'transparent', border: '1px solid #ddd', borderRadius: 4, padding: '6px 10px', fontSize: 12, color: '#888' }}>🎥 Video</button>
                      <button type="button" disabled title="Event (coming soon)" style={{ background: 'transparent', border: '1px solid #ddd', borderRadius: 4, padding: '6px 10px', fontSize: 12, color: '#888' }}>📅 Event</button>
                      <button type="button" disabled title="Write (coming soon)" style={{ background: 'transparent', border: '1px solid #ddd', borderRadius: 4, padding: '6px 10px', fontSize: 12, color: '#888' }}>✍️ Write</button>
                      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ color: colors.textSecondary, fontSize: 13 }}>Visible to:</span>
                        <select disabled defaultValue="private" title="Public feed later (admin approval). Private shows here only." style={{ padding: '6px 8px', border: '1px solid #ddd', borderRadius: 4, fontSize: 12 }}>
                          <option value="public">Public</option>
                          <option value="private">Private</option>
                        </select>
                      </div>
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center' 
                    }}>
                      <div style={{ fontSize: '0.8rem', color: colors.textSecondary }}>
                        <span style={{ fontStyle: 'italic' }}>
                          💡 Future features: Media uploads, events, polls, and more!
                        </span>
                      </div>
                      <button
                        type="submit"
                        disabled={!newPost.trim()}
                        style={{
                          background: colors.primary,
                          color: 'white',
                          border: 'none',
                          borderRadius: 4,
                          padding: '8px 16px',
                          cursor: newPost.trim() ? 'pointer' : 'not-allowed',
                          fontSize: 14,
                          opacity: newPost.trim() ? 1 : 0.6
                        }}
                      >
                        Share Post
                      </button>
                      <button
                        type="button"
                        disabled={!newPost.trim()}
                        onClick={() => {
                          if (!newPost.trim()) return;
                          const request = {
                            id: `req_${Date.now()}`,
                            clubId: club.id,
                            clubName: club.name,
                            requestedBy: userInfo?.email,
                            content: newPost.trim(),
                            createdAt: new Date().toISOString(),
                            status: 'pending'
                          };
                          try {
                            const queued = JSON.parse(localStorage.getItem('publicPostRequests') || '[]');
                            localStorage.setItem('publicPostRequests', JSON.stringify([request, ...queued]));
                            alert('Request sent to admins for review.');
                          } catch (_) { /* ignore */ }
                        }}
                        style={{
                          background: 'transparent',
                          color: colors.link || '#007bff',
                          border: '1px solid #cbd5e1',
                          borderRadius: 4,
                          padding: '8px 12px',
                          cursor: newPost.trim() ? 'pointer' : 'not-allowed',
                          fontSize: 14
                        }}
                        title="Ask admins to publish this post on the public news feed"
                      >
                        Request Public Post
                      </button>
                    </div>
                  </form>
               </div>
             )}

             {/* Posts Header */}
             <div style={{
               background: 'white',
               borderRadius: 8,
               padding: '1rem 1.5rem',
               marginBottom: '1rem',
               boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
               border: '1px solid #eee'
             }}>
               <h3 style={{ margin: 0, color: colors.textPrimary }}>
                 Club Posts ({club.posts.length})
               </h3>
               <p style={{ 
                 margin: '4px 0 0 0', 
                 color: colors.textSecondary, 
                 fontSize: '0.9rem' 
               }}>
                 {isMember ? 'Club posts are visible to all users but only shown on this page.' : 'Club posts are shared by club members.'}
               </p>
             </div>

                         {/* Posts List */}
             <div style={{ display: 'grid', gap: '1rem' }}>
               {club.posts.length === 0 ? (
                 <div style={{
                   background: 'white',
                   borderRadius: 8,
                   padding: '2rem',
                   textAlign: 'center',
                   boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                   border: '1px solid #eee'
                 }}>
                   <p style={{ color: colors.textSecondary, margin: 0 }}>
                     No posts yet. {isMember ? 'Be the first to share something!' : 'Club members can share posts here.'}
                   </p>
                 </div>
               ) : (
                 club.posts.map(post => (
                   <div key={post.id} style={{
                     background: 'white',
                     borderRadius: 8,
                     padding: '1.5rem',
                     boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                     border: '1px solid #eee'
                   }}>
                     <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                       <img
                         src={post.authorAvatar}
                         alt={post.author}
                         style={{
                           width: 40,
                           height: 40,
                           borderRadius: '50%',
                           marginRight: '12px'
                         }}
                       />
                       <div>
                         <div style={{ fontWeight: 500, color: colors.textPrimary }}>
                           {post.author}
                         </div>
                         <div style={{ fontSize: '0.8rem', color: colors.textSecondary }}>
                           {new Date(post.timestamp).toLocaleString()}
                         </div>
                       </div>
                     </div>
                     <p style={{ 
                       color: colors.textPrimary,
                       lineHeight: 1.5,
                       marginBottom: '1rem'
                     }}>
                       {post.content}
                     </p>
                     <div style={{ 
                       display: 'flex', 
                       gap: '1rem',
                       fontSize: '0.9rem',
                       color: colors.textSecondary
                     }}>
                       <span>👍 {post.likes}</span>
                       <span>💬 {post.comments}</span>
                     </div>
                   </div>
                 ))
               )}
             </div>
          </div>
        )}

        {activeTab === 'contact' && (
          <div style={{
            background: 'white',
            borderRadius: 8,
            padding: '2.25rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #eee'
          }}>
            <h2 style={{ margin: 0, color: colors.textPrimary, textAlign: 'center', fontSize: 28 }}>
              Contact Us
            </h2>
            <div style={{ height: 12 }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem', maxWidth: 900, margin: '0 auto' }}>
              {[{ email: club.contact.email, tel: club.contact.phone || '+11 555-666 12', wa: '+16 444-666 12' },
                { email: 'example2@example2.com', tel: '+16 555-666 12', wa: '+16 333-666 12' }].map((c, i) => (
                <div key={i} style={{ display: 'grid', gap: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 18 }}>✉️</span>
                    <span style={{ color: colors.textPrimary }}>{c.email}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 18 }}>📞</span>
                    <span style={{ color: colors.textPrimary }}>{c.tel}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 18 }}>💬</span>
                    <span style={{ color: colors.textPrimary }}>{c.wa}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {showEditClubModal && (
        <EditClubModal
          club={club}
          onClose={() => setShowEditClubModal(false)}
          onSave={handleSaveClub}
        />
      )}
    </div>
  );
};

export default ClubDetailPage;

// Edit Club Modal Component (inline for now)
export const EditClubModal = ({ club, onClose, onSave }) => {
  const [form, setForm] = useState({
    name: club.name || '',
    description: club.description || '',
    category: club.category || '',
    profilePicture: club.profilePicture || '',
    banner: club.banner || '',
    contactEmail: club.contact?.email || '',
    contactPhone: club.contact?.phone || '',
    contactLocation: club.contact?.location || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      name: form.name,
      description: form.description,
      category: form.category,
      profilePicture: form.profilePicture,
      banner: form.banner,
      contact: {
        email: form.contactEmail,
        phone: form.contactPhone,
        location: form.contactLocation
      }
    });
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{ background: 'white', borderRadius: 8, padding: '2rem', width: '95%', maxWidth: 980 }}>
        <h2 style={{ margin: '0 0 1.25rem 0', color: colors.textPrimary, fontSize: 28 }}>Edit Club Profile</h2>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <label style={{ fontWeight: 500 }}>Club Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4 }} />
            <label style={{ fontWeight: 500 }}>Club Description</label>
            <textarea rows={6} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4 }} />
          </div>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <label style={{ fontWeight: 500 }}>Description</label>
            <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4 }} />
            <label style={{ fontWeight: 500 }}>Category</label>
            <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4 }} />
          </div>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <label style={{ fontWeight: 500 }}>Category</label>
            <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4 }} />
            <label style={{ fontWeight: 500 }}>Profile Picture URL</label>
            <input value={form.profilePicture} onChange={(e) => setForm({ ...form, profilePicture: e.target.value })} style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4 }} />
          </div>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <label style={{ fontWeight: 500 }}>Profile Picture URL</label>
            <input value={form.profilePicture} onChange={(e) => setForm({ ...form, profilePicture: e.target.value })} style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4 }} />
            <label style={{ fontWeight: 500 }}>Banner URL</label>
            <input value={form.banner} onChange={(e) => setForm({ ...form, banner: e.target.value })} style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4 }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <label style={{ fontWeight: 500 }}>Contact Email</label>
              <input type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4 }} />
            </div>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <label style={{ fontWeight: 500 }}>Contact Phone</label>
              <input value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4 }} />
            </div>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <label style={{ fontWeight: 500 }}>Location</label>
              <input value={form.contactLocation} onChange={(e) => setForm({ ...form, contactLocation: e.target.value })} style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4 }} />
            </div>
          </div>
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" onClick={onClose} style={{ background: 'transparent', color: colors.textPrimary, border: '1px solid #cbd5e1', borderRadius: 6, padding: '10px 16px', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ background: '#18458B', color: 'white', border: 'none', borderRadius: 6, padding: '10px 16px', cursor: 'pointer' }}>Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}; 