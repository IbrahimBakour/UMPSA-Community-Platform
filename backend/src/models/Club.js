const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Club name is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Club name cannot exceed 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Club description is required'],
    trim: true,
    maxlength: [1000, 'Club description cannot exceed 1000 characters'],
  },
  category: {
    type: String,
    required: [true, 'Club category is required'],
    enum: ['Technology', 'Arts & Culture', 'Environment', 'Business', 'Sports', 'Education', 'Social', 'Academic', 'Other'],
    trim: true,
  },
  
  // Location and Contact
  location: {
    type: String,
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters'],
  },
  contactEmail: {
    type: String,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
  },
  contactPhone: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number'],
  },
  
  // Media and Visual
  profilePicture: {
    type: String,
    default: '',
  },
  banner: {
    type: String,
    default: '',
  },
  
  // Settings and Status
  isPublic: {
    type: Boolean,
    default: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isApproved: {
    type: Boolean,
    default: false, // Clubs need admin approval
  },
  
  // Membership
  maxMembers: {
    type: Number,
    default: 100,
    min: [1, 'Maximum members must be at least 1'],
    max: [1000, 'Maximum members cannot exceed 1000'],
  },
  memberCount: {
    type: Number,
    default: 0,
    min: [0, 'Member count cannot be negative'],
  },
  
  // Leadership
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  leaders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  
  // Tags and Metadata
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters'],
  }],
  
  // Social Media Links
  socialLinks: {
    website: String,
    facebook: String,
    instagram: String,
    twitter: String,
    linkedin: String,
  },
  
  // Meeting Information
  meetingSchedule: {
    frequency: {
      type: String,
      enum: ['weekly', 'bi-weekly', 'monthly', 'quarterly', 'as-needed'],
      default: 'weekly',
    },
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    },
    time: String,
    location: String,
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  approvedAt: Date,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual for checking if club is full
clubSchema.virtual('isFull').get(function() {
  return this.memberCount >= this.maxMembers;
});

// Virtual for checking if club can accept new members
clubSchema.virtual('canAcceptMembers').get(function() {
  return this.isActive && this.isApproved && !this.isFull;
});

// Virtual for member count percentage
clubSchema.virtual('memberCountPercentage').get(function() {
  return Math.round((this.memberCount / this.maxMembers) * 100);
});

// Indexes for better query performance
clubSchema.index({ name: 1 });
clubSchema.index({ category: 1 });
clubSchema.index({ isActive: 1 });
clubSchema.index({ isApproved: 1 });
clubSchema.index({ createdBy: 1 });
clubSchema.index({ createdAt: -1 });
clubSchema.index({ memberCount: -1 });

// Pre-save middleware to update timestamps
clubSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Pre-save middleware to ensure creator is in leaders array
clubSchema.pre('save', function(next) {
  if (this.isNew && !this.leaders.includes(this.createdBy)) {
    this.leaders.push(this.createdBy);
  }
  next();
});

// Static method to find approved clubs
clubSchema.statics.findApproved = function() {
  return this.find({ isActive: true, isApproved: true });
};

// Static method to find clubs by category
clubSchema.statics.findByCategory = function(category) {
  return this.find({ category, isActive: true, isApproved: true });
};

// Static method to find clubs by creator
clubSchema.statics.findByCreator = function(creatorId) {
  return this.find({ createdBy: creatorId });
};

// Static method to find clubs where user is leader
clubSchema.statics.findByLeader = function(userId) {
  return this.find({ leaders: userId, isActive: true });
};

// Static method to search clubs
clubSchema.statics.search = function(query) {
  const searchRegex = new RegExp(query, 'i');
  return this.find({
    $and: [
      { isActive: true, isApproved: true },
      {
        $or: [
          { name: searchRegex },
          { description: searchRegex },
          { category: searchRegex },
          { tags: searchRegex },
        ],
      },
    ],
  });
};

// Instance method to add member
clubSchema.methods.addMember = function(userId, role = 'member') {
  if (this.isFull) {
    throw new Error('Club is at maximum capacity');
  }
  
  if (!this.isActive || !this.isApproved) {
    throw new Error('Club is not active or approved');
  }
  
  // This method will be used in conjunction with ClubMember model
  return true;
};

// Instance method to remove member
clubSchema.methods.removeMember = function(userId) {
  // This method will be used in conjunction with ClubMember model
  return true;
};

// Instance method to promote member to leader
clubSchema.methods.promoteToLeader = function(userId) {
  if (!this.leaders.includes(userId)) {
    this.leaders.push(userId);
    return this.save();
  }
  return Promise.resolve(this);
};

// Instance method to demote leader to member
clubSchema.methods.demoteLeader = function(userId) {
  const index = this.leaders.indexOf(userId);
  if (index > -1) {
    this.leaders.splice(index, 1);
    return this.save();
  }
  return Promise.resolve(this);
};

// Instance method to get public info
clubSchema.methods.getPublicInfo = function() {
  const clubObject = this.toObject();
  
  // Remove sensitive fields
  delete clubObject.contactEmail;
  delete clubObject.contactPhone;
  delete clubObject.meetingSchedule;
  
  return clubObject;
};

const Club = mongoose.model('Club', clubSchema);

module.exports = Club;
