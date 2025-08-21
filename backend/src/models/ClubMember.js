const mongoose = require('mongoose');

const clubMemberSchema = new mongoose.Schema({
  // References
  clubId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  // Membership Details
  role: {
    type: String,
    enum: ['member', 'leader'],
    default: 'member',
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'pending'],
    default: 'active',
    required: true,
  },
  
  // Permissions (based on role)
  permissions: {
    canPost: {
      type: Boolean,
      default: true,
    },
    canInvite: {
      type: Boolean,
      default: false,
    },
    canManage: {
      type: Boolean,
      default: false,
    },
    canModerate: {
      type: Boolean,
      default: false,
    },
  },
  
  // Membership Information
  joinedAt: {
    type: Date,
    default: Date.now,
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  invitationAcceptedAt: Date,
  
  // Activity Tracking
  lastActive: {
    type: Date,
    default: Date.now,
  },
  postCount: {
    type: Number,
    default: 0,
  },
  eventAttendance: {
    type: Number,
    default: 0,
  },
  
  // Notes and Moderation
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters'],
  },
  suspendedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  suspendedAt: Date,
  suspensionReason: String,
  suspensionExpires: Date,
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Compound unique index to prevent duplicate memberships
clubMemberSchema.index({ clubId: 1, userId: 1 }, { unique: true });

// Indexes for better query performance
clubMemberSchema.index({ clubId: 1, role: 1 });
clubMemberSchema.index({ userId: 1, status: 1 });
clubMemberSchema.index({ status: 1 });
clubMemberSchema.index({ joinedAt: -1 });
clubMemberSchema.index({ lastActive: -1 });

// Pre-save middleware to update timestamps
clubMemberSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Pre-save middleware to set permissions based on role
clubMemberSchema.pre('save', function(next) {
  if (this.role === 'leader') {
    this.permissions.canInvite = true;
    this.permissions.canManage = true;
    this.permissions.canModerate = true;
  } else if (this.role === 'member') {
    this.permissions.canInvite = false;
    this.permissions.canManage = false;
    this.permissions.canModerate = false;
  }
  next();
});

// Pre-save middleware to update club member count
clubMemberSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('status')) {
    try {
      const Club = mongoose.model('Club');
      const club = await Club.findById(this.clubId);
      
      if (club) {
        if (this.isNew && this.status === 'active') {
          club.memberCount += 1;
        } else if (!this.isNew && this.status === 'active' && this._originalStatus !== 'active') {
          club.memberCount += 1;
        } else if (!this.isNew && this.status !== 'active' && this._originalStatus === 'active') {
          club.memberCount = Math.max(0, club.memberCount - 1);
        }
        
        await club.save();
      }
    } catch (error) {
      console.error('Error updating club member count:', error);
    }
  }
  next();
});

// Pre-save middleware to track original status for comparison
clubMemberSchema.pre('save', function(next) {
  if (!this.isNew) {
    this._originalStatus = this._originalStatus || this.status;
  }
  next();
});

// Static method to find active members of a club
clubMemberSchema.statics.findActiveMembers = function(clubId) {
  return this.find({ clubId, status: 'active' }).populate('userId', 'name email avatarUrl role');
};

// Static method to find leaders of a club
clubMemberSchema.statics.findLeaders = function(clubId) {
  return this.find({ clubId, role: 'leader', status: 'active' }).populate('userId', 'name email avatarUrl');
};

// Static method to find clubs where user is a member
clubMemberSchema.statics.findUserClubs = function(userId) {
  return this.find({ userId, status: 'active' }).populate('clubId');
};

// Static method to find clubs where user is a leader
clubMemberSchema.statics.findUserLeaderClubs = function(userId) {
  return this.find({ userId, role: 'leader', status: 'active' }).populate('clubId');
};

// Static method to check if user is member of club
clubMemberSchema.statics.isMember = function(clubId, userId) {
  return this.exists({ clubId, userId, status: 'active' });
};

// Static method to check if user is leader of club
clubMemberSchema.statics.isLeader = function(clubId, userId) {
  return this.exists({ clubId, userId, role: 'leader', status: 'active' });
};

// Instance method to promote member to leader
clubMemberSchema.methods.promoteToLeader = function() {
  this.role = 'leader';
  this.permissions.canInvite = true;
  this.permissions.canManage = true;
  this.permissions.canModerate = true;
  return this.save();
};

// Instance method to demote leader to member
clubMemberSchema.methods.demoteToMember = function() {
  this.role = 'member';
  this.permissions.canInvite = false;
  this.permissions.canManage = false;
  this.permissions.canModerate = false;
  return this.save();
};

// Instance method to suspend member
clubMemberSchema.methods.suspend = function(reason, duration, suspendedBy) {
  this.status = 'suspended';
  this.suspendedBy = suspendedBy;
  this.suspendedAt = new Date();
  this.suspensionReason = reason;
  this.suspensionExpires = duration ? new Date(Date.now() + duration) : null;
  return this.save();
};

// Instance method to reactivate member
clubMemberSchema.methods.reactivate = function() {
  this.status = 'active';
  this.suspendedBy = undefined;
  this.suspendedAt = undefined;
  this.suspensionReason = undefined;
  this.suspensionExpires = undefined;
  return this.save();
};

// Instance method to update last activity
clubMemberSchema.methods.updateActivity = function() {
  this.lastActive = new Date();
  return this.save();
};

// Instance method to increment post count
clubMemberSchema.methods.incrementPostCount = function() {
  this.postCount += 1;
  return this.save();
};

// Instance method to increment event attendance
clubMemberSchema.methods.incrementEventAttendance = function() {
  this.eventAttendance += 1;
  return this.save();
};

// Instance method to get public profile
clubMemberSchema.methods.getPublicProfile = function() {
  const memberObject = this.toObject();
  
  // Remove sensitive fields
  delete memberObject.notes;
  delete memberObject.suspendedBy;
  delete memberObject.suspensionReason;
  delete memberObject.suspendedAt;
  delete memberObject.suspensionExpires;
  
  return memberObject;
};

const ClubMember = mongoose.model('ClubMember', clubMemberSchema);

module.exports = ClubMember;
