const Club = require('../models/Club');
const ClubMember = require('../models/ClubMember');
const User = require('../models/User');
const { successResponse, errorResponse, paginateResponse, transformClub, transformUser, buildSearchQuery, buildFilterQuery } = require('../utils/response');

// @desc    Get all clubs with pagination and filters
// @route   GET /api/clubs
// @access  Public
const getClubs = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category, status } = req.query;
    
    // Build search and filter queries
    const searchQuery = buildSearchQuery(search, ['name', 'description', 'tags']);
    const filterQuery = buildFilterQuery({ category, status, isActive: true });
    
    // Combine queries
    const query = { ...searchQuery, ...filterQuery };
    
    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [clubs, total] = await Promise.all([
      Club.find(query)
        .select('name description category profilePicture banner memberCount tags isActive createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Club.countDocuments(query)
    ]);
    
    // Transform clubs
    const transformedClubs = clubs.map(club => transformClub(club));
    
    return paginateResponse(res, transformedClubs, parseInt(page), parseInt(limit), total, 'Clubs retrieved successfully');
    
  } catch (error) {
    console.error('Get clubs error:', error);
    return errorResponse(res, 'Failed to retrieve clubs', 500);
  }
};

// @desc    Create a new club
// @route   POST /api/clubs
// @access  Admin only
const createClub = async (req, res) => {
  try {
    const { name, description, category, tags, location, contact, meetingInfo } = req.body;
    
    // Create club
    const clubData = {
      name,
      description,
      category,
      tags: tags || [],
      location: location || {},
      contact: contact || {},
      meetingInfo: meetingInfo || {},
      creator: req.user._id,
      leaders: [req.user._id]
    };
    
    const club = new Club(clubData);
    await club.save();
    
    // Create initial membership for creator
    const membership = new ClubMember({
      user: req.user._id,
      club: club._id,
      role: 'leader',
      status: 'active',
      permissions: ['manage_club', 'manage_members', 'manage_posts', 'view_club'],
      joinedAt: new Date()
    });
    
    await membership.save();
    
    // Update club member count
    club.memberCount = 1;
    await club.save();
    
    // Transform and return club
    const transformedClub = transformClub(club);
    
    return successResponse(res, transformedClub, 'Club created successfully', 201);
    
  } catch (error) {
    console.error('Create club error:', error);
    return errorResponse(res, 'Failed to create club', 500);
  }
};

// @desc    Get club by ID with detailed information
// @route   GET /api/clubs/:clubId
// @access  Public
const getClub = async (req, res) => {
  try {
    const { clubId } = req.params;
    
    // Find club with populated data
    const club = await Club.findById(clubId)
      .populate('leaders', 'name email avatarUrl')
      .populate('creator', 'name email avatarUrl');
    
    if (!club) {
      return errorResponse(res, 'Club not found', 404);
    }
    
    if (!club.isActive) {
      return errorResponse(res, 'Club is not active', 404);
    }
    
    // Get member count
    const memberCount = await ClubMember.countDocuments({ club: clubId, status: 'active' });
    
    // Get recent posts (limit to 5)
    const recentPosts = await require('../models/Post')
      .find({ club: clubId, visibility: 'club', isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('author', 'name avatarUrl');
    
    // Transform club
    const transformedClub = transformClub(club);
    transformedClub.memberCount = memberCount;
    transformedClub.recentPosts = recentPosts;
    
    return successResponse(res, transformedClub, 'Club details retrieved successfully');
    
  } catch (error) {
    console.error('Get club error:', error);
    return errorResponse(res, 'Failed to retrieve club details', 500);
  }
};

// @desc    Update club information
// @route   PUT /api/clubs/:clubId
// @access  Club leader or admin
const updateClub = async (req, res) => {
  try {
    const { clubId } = req.params;
    const updateData = req.body;
    
    // Find club
    const club = await Club.findById(clubId);
    if (!club) {
      return errorResponse(res, 'Club not found', 404);
    }
    
    // Update club
    const updatedClub = await Club.findByIdAndUpdate(
      clubId,
      updateData,
      { new: true, runValidators: true }
    );
    
    // Transform and return updated club
    const transformedClub = transformClub(updatedClub);
    
    return successResponse(res, transformedClub, 'Club updated successfully');
    
  } catch (error) {
    console.error('Update club error:', error);
    return errorResponse(res, 'Failed to update club', 500);
  }
};

// @desc    Delete club (admin only)
// @route   DELETE /api/clubs/:clubId
// @access  Admin only
const deleteClub = async (req, res) => {
  try {
    const { clubId } = req.params;
    
    // Find club
    const club = await Club.findById(clubId);
    if (!club) {
      return errorResponse(res, 'Club not found', 404);
    }
    
    // Check if club has active members
    const activeMembers = await ClubMember.countDocuments({ club: clubId, status: 'active' });
    if (activeMembers > 0) {
      return errorResponse(res, 'Cannot delete club with active members. Please remove all members first.', 400);
    }
    
    // Archive club instead of deleting
    club.isActive = false;
    club.archivedAt = new Date();
    await club.save();
    
    return successResponse(res, null, 'Club archived successfully');
    
  } catch (error) {
    console.error('Delete club error:', error);
    return errorResponse(res, 'Failed to delete club', 500);
  }
};

// @desc    Get club members with pagination
// @route   GET /api/clubs/:clubId/members
// @access  Public
const getClubMembers = async (req, res) => {
  try {
    const { clubId } = req.params;
    const { page = 1, limit = 20, role, status } = req.query;
    
    // Build filter query
    const filterQuery = { club: clubId };
    if (role) filterQuery.role = role;
    if (status) filterQuery.status = status;
    else filterQuery.status = 'active';
    
    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [memberships, total] = await Promise.all([
      ClubMember.find(filterQuery)
        .populate('user', 'name email avatarUrl studentId faculty yearOfStudy')
        .sort({ joinedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      ClubMember.countDocuments(filterQuery)
    ]);
    
    // Transform memberships
    const transformedMembers = memberships.map(membership => ({
      id: membership._id,
      user: transformUser(membership.user),
      role: membership.role,
      status: membership.status,
      joinedAt: membership.joinedAt,
      permissions: membership.permissions
    }));
    
    return paginateResponse(res, transformedMembers, parseInt(page), parseInt(limit), total, 'Club members retrieved successfully');
    
  } catch (error) {
    console.error('Get members error:', error);
    return errorResponse(res, 'Failed to retrieve club members', 500);
  }
};

// @desc    Add member to club
// @route   POST /api/clubs/:clubId/members
// @access  Club leader or admin
const addMember = async (req, res) => {
  try {
    const { clubId } = req.params;
    const { userId, role = 'member', permissions = [] } = req.body;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }
    
    // Check if already a member
    const existingMembership = await ClubMember.findOne({ user: userId, club: clubId });
    if (existingMembership) {
      return errorResponse(res, 'User is already a member of this club', 400);
    }
    
    // Set default permissions based on role
    let defaultPermissions = ['view_club'];
    if (role === 'leader') {
      defaultPermissions = ['manage_club', 'manage_members', 'manage_posts', 'view_club'];
    } else if (role === 'moderator') {
      defaultPermissions = ['manage_posts', 'view_club'];
    }
    
    // Create membership
    const membership = new ClubMember({
      user: userId,
      club: clubId,
      role,
      status: 'active',
      permissions: permissions.length > 0 ? permissions : defaultPermissions,
      joinedAt: new Date()
    });
    
    await membership.save();
    
    // Update club member count
    await Club.findByIdAndUpdate(clubId, { $inc: { memberCount: 1 } });
    
    // Populate user data for response
    await membership.populate('user', 'name email avatarUrl');
    
    const transformedMember = {
      id: membership._id,
      user: transformUser(membership.user),
      role: membership.role,
      status: membership.status,
      joinedAt: membership.joinedAt,
      permissions: membership.permissions
    };
    
    return successResponse(res, transformedMember, 'Member added successfully', 201);
    
  } catch (error) {
    console.error('Add member error:', error);
    return errorResponse(res, 'Failed to add member', 500);
  }
};

// @desc    Update member role/permissions
// @route   PUT /api/clubs/:clubId/members/:userId
// @access  Club leader or admin
const updateMember = async (req, res) => {
  try {
    const { clubId, userId } = req.params;
    const { role, permissions, status } = req.body;
    
    // Find membership
    const membership = await ClubMember.findOne({ user: userId, club: clubId });
    if (!membership) {
      return errorResponse(res, 'Membership not found', 404);
    }
    
    // Update membership
    const updateData = {};
    if (role) updateData.role = role;
    if (permissions) updateData.permissions = permissions;
    if (status) updateData.status = status;
    
    const updatedMembership = await ClubMember.findByIdAndUpdate(
      membership._id,
      updateData,
      { new: true, runValidators: true }
    ).populate('user', 'name email avatarUrl');
    
    // Transform and return updated membership
    const transformedMember = {
      id: updatedMembership._id,
      user: transformUser(updatedMembership.user),
      role: updatedMembership.role,
      status: updatedMembership.status,
      joinedAt: updatedMembership.joinedAt,
      permissions: updatedMembership.permissions
    };
    
    return successResponse(res, transformedMember, 'Member updated successfully');
    
  } catch (error) {
    console.error('Update member error:', error);
    return errorResponse(res, 'Failed to update member', 500);
  }
};

// @desc    Remove member from club
// @route   DELETE /api/clubs/:clubId/members/:userId
// @access  Club leader or admin
const removeMember = async (req, res) => {
  try {
    const { clubId, userId } = req.params;
    
    // Find membership
    const membership = await ClubMember.findOne({ user: userId, club: clubId });
    if (!membership) {
      return errorResponse(res, 'Membership not found', 404);
    }
    
    // Check if trying to remove the last leader
    if (membership.role === 'leader') {
      const leaderCount = await ClubMember.countDocuments({ club: clubId, role: 'leader', status: 'active' });
      if (leaderCount <= 1) {
        return errorResponse(res, 'Cannot remove the last leader. Please assign a new leader first.', 400);
      }
    }
    
    // Remove membership
    await ClubMember.findByIdAndDelete(membership._id);
    
    // Update club member count
    await Club.findByIdAndUpdate(clubId, { $inc: { memberCount: -1 } });
    
    return successResponse(res, null, 'Member removed successfully');
    
  } catch (error) {
    console.error('Remove member error:', error);
    return errorResponse(res, 'Failed to remove member', 500);
  }
};

// @desc    Join club (request membership)
// @route   POST /api/clubs/:clubId/join
// @access  Authenticated users
const joinClub = async (req, res) => {
  try {
    const { clubId } = req.params;
    const userId = req.user._id;
    
    // Check if already a member
    const existingMembership = await ClubMember.findOne({ user: userId, club: clubId });
    if (existingMembership) {
      if (existingMembership.status === 'active') {
        return errorResponse(res, 'You are already a member of this club', 400);
      } else if (existingMembership.status === 'pending') {
        return errorResponse(res, 'Your membership request is already pending', 400);
      }
    }
    
    // Get club info
    const club = await Club.findById(clubId);
    if (!club || !club.isActive) {
      return errorResponse(res, 'Club not found or inactive', 404);
    }
    
    // Check if club allows open enrollment
    const isOpenEnrollment = club.settings?.openEnrollment !== false;
    
    // Create membership
    const membership = new ClubMember({
      user: userId,
      club: clubId,
      role: 'member',
      status: isOpenEnrollment ? 'active' : 'pending',
      permissions: ['view_club'],
      joinedAt: new Date()
    });
    
    await membership.save();
    
    // Update club member count if auto-approved
    if (isOpenEnrollment) {
      await Club.findByIdAndUpdate(clubId, { $inc: { memberCount: 1 } });
    }
    
    const message = isOpenEnrollment 
      ? 'Successfully joined the club' 
      : 'Membership request submitted successfully';
    
    return successResponse(res, null, message, isOpenEnrollment ? 200 : 201);
    
  } catch (error) {
    console.error('Join club error:', error);
    return errorResponse(res, 'Failed to submit join request', 500);
  }
};

// @desc    Leave club
// @route   POST /api/clubs/:clubId/leave
// @access  Club members
const leaveClub = async (req, res) => {
  try {
    const { clubId } = req.params;
    const userId = req.user._id;
    
    // Find membership
    const membership = await ClubMember.findOne({ user: userId, club: clubId, status: 'active' });
    if (!membership) {
      return errorResponse(res, 'You are not a member of this club', 400);
    }
    
    // Check if trying to leave as the last leader
    if (membership.role === 'leader') {
      const leaderCount = await ClubMember.countDocuments({ club: clubId, role: 'leader', status: 'active' });
      if (leaderCount <= 1) {
        return errorResponse(res, 'Cannot leave as the last leader. Please assign a new leader first.', 400);
      }
    }
    
    // Remove membership
    await ClubMember.findByIdAndDelete(membership._id);
    
    // Update club member count
    await Club.findByIdAndUpdate(clubId, { $inc: { memberCount: -1 } });
    
    return successResponse(res, null, 'Left club successfully');
    
  } catch (error) {
    console.error('Leave club error:', error);
    return errorResponse(res, 'Failed to leave club', 500);
  }
};

// @desc    Get club posts with pagination
// @route   GET /api/clubs/:clubId/posts
// @access  Public
const getClubPosts = async (req, res) => {
  try {
    const { clubId } = req.params;
    const { page = 1, limit = 20, type, author } = req.query;
    
    // Build filter query
    const filterQuery = { club: clubId, visibility: 'club', isActive: true };
    if (type) filterQuery.postType = type;
    if (author) filterQuery.author = author;
    
    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const Post = require('../models/Post');
    const [posts, total] = await Promise.all([
      Post.find(filterQuery)
        .populate('author', 'name avatarUrl')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Post.countDocuments(filterQuery)
    ]);
    
    // Transform posts
    const transformedPosts = posts.map(post => ({
      id: post._id,
      content: post.content,
      author: transformUser(post.author),
      postType: post.postType,
      media: post.media,
      likes: post.likes?.length || 0,
      comments: post.comments?.length || 0,
      tags: post.tags,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt
    }));
    
    return paginateResponse(res, transformedPosts, parseInt(page), parseInt(limit), total, 'Club posts retrieved successfully');
    
  } catch (error) {
    console.error('Get club posts error:', error);
    return errorResponse(res, 'Failed to retrieve club posts', 500);
  }
};

module.exports = {
  getClubs,
  createClub,
  getClub,
  updateClub,
  deleteClub,
  getClubMembers,
  addMember,
  updateMember,
  removeMember,
  joinClub,
  leaveClub,
  getClubPosts
};
