const mongoose = require('mongoose');

const publicPostRequestSchema = new mongoose.Schema({
  // Request Information
  clubId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    required: true,
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  // Content Details
  content: {
    type: String,
    required: [true, 'Post content is required'],
    trim: true,
    maxlength: [2000, 'Post content cannot exceed 2000 characters'],
  },
  title: {
    type: String,
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  
  // Media Content
  media: [{
    type: {
      type: String,
      enum: ['image', 'video', 'document'],
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    filename: String,
    originalName: String,
    size: Number,
    mimeType: String,
    thumbnail: String,
  }],
  
  // Request Status and Workflow
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'under_review'],
    default: 'pending',
  },
  
  // Review Information
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  reviewedAt: Date,
  reviewNotes: String,
  reviewReason: String,
  
  // Approval/Rejection Details
  approvedAt: Date,
  rejectedAt: Date,
  rejectionReason: String,
  
  // Priority and Assignment
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal',
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  
  // Content Categories and Tags
  category: {
    type: String,
    enum: ['announcement', 'event', 'news', 'achievement', 'general'],
    default: 'general',
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters'],
  }],
  
  // Scheduling (if approved)
  scheduledFor: Date,
  isScheduled: {
    type: Boolean,
    default: false,
  },
  
  // Related Post (if approved)
  approvedPostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
  },
  
  // Moderation History
  moderationHistory: [{
    action: {
      type: String,
      enum: ['submitted', 'assigned', 'reviewed', 'approved', 'rejected', 'scheduled'],
      required: true,
    },
    moderatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    notes: String,
    reason: String,
  }],
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  
  // Expiration (auto-reject if not reviewed)
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    },
  },
  
  // Follow-up Information
  requiresFollowUp: {
    type: Boolean,
    default: false,
  },
  followUpDate: Date,
  followUpNotes: String,
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual for request age
publicPostRequestSchema.virtual('age').get(function() {
  return Date.now() - this.createdAt;
});

// Virtual for checking if request is expired
publicPostRequestSchema.virtual('isExpired').get(function() {
  return Date.now() > this.expiresAt;
});

// Virtual for checking if request is overdue
publicPostRequestSchema.virtual('isOverdue').get(function() {
  const now = Date.now();
  const requestAge = now - this.createdAt;
  
  // Different thresholds based on priority
  const thresholds = {
    urgent: 2 * 60 * 60 * 1000,      // 2 hours
    high: 24 * 60 * 60 * 1000,       // 24 hours
    normal: 3 * 24 * 60 * 60 * 1000, // 3 days
    low: 7 * 24 * 60 * 60 * 1000,    // 7 days
  };
  
  return requestAge > thresholds[this.priority];
});

// Indexes for better query performance
publicPostRequestSchema.index({ status: 1, priority: 1, createdAt: -1 });
publicPostRequestSchema.index({ clubId: 1, status: 1 });
publicPostRequestSchema.index({ requestedBy: 1, createdAt: -1 });
publicPostRequestSchema.index({ assignedTo: 1, status: 1 });
publicPostRequestSchema.index({ priority: 1, createdAt: -1 });
publicPostRequestSchema.index({ category: 1, status: 1 });
publicPostRequestSchema.index({ expiresAt: 1 });
publicPostRequestSchema.index({ requiresFollowUp: 1, followUpDate: 1 });

// Pre-save middleware to update timestamps
publicPostRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Add to moderation history if this is a new request
  if (this.isNew) {
    this.moderationHistory.push({
      action: 'submitted',
      moderatorId: this.requestedBy,
      timestamp: new Date(),
      notes: 'Request submitted',
    });
  }
  
  next();
});

// Pre-save middleware to validate content
publicPostRequestSchema.pre('save', function(next) {
  if (!this.content || this.content.trim().length === 0) {
    return next(new Error('Post content cannot be empty'));
  }
  
  if (this.content.length > 2000) {
    return next(new Error('Post content cannot exceed 2000 characters'));
  }
  
  next();
});

// Static method to find pending requests
publicPostRequestSchema.statics.findPending = function() {
  return this.find({ status: 'pending' })
    .populate('clubId', 'name profilePicture')
    .populate('requestedBy', 'name email role')
    .populate('assignedTo', 'name email role')
    .sort({ priority: -1, createdAt: 1 });
};

// Static method to find requests by status
publicPostRequestSchema.statics.findByStatus = function(status) {
  return this.find({ status })
    .populate('clubId', 'name profilePicture')
    .populate('requestedBy', 'name email role')
    .populate('assignedTo', 'name email role')
    .sort({ createdAt: -1 });
};

// Static method to find requests by club
publicPostRequestSchema.statics.findByClub = function(clubId) {
  return this.find({ clubId })
    .populate('requestedBy', 'name email role')
    .populate('assignedTo', 'name email role')
    .sort({ createdAt: -1 });
};

// Static method to find requests by requester
publicPostRequestSchema.statics.findByRequester = function(userId) {
  return this.find({ requestedBy: userId })
    .populate('clubId', 'name profilePicture')
    .populate('assignedTo', 'name email role')
    .sort({ createdAt: -1 });
};

// Static method to find overdue requests
publicPostRequestSchema.statics.findOverdue = function() {
  const now = Date.now();
  const urgentThreshold = now - (2 * 60 * 60 * 1000);
  const highThreshold = now - (24 * 60 * 60 * 1000);
  const normalThreshold = now - (3 * 24 * 60 * 60 * 1000);
  const lowThreshold = now - (7 * 24 * 60 * 60 * 1000);
  
  return this.find({
    status: { $in: ['pending', 'under_review'] },
    $or: [
      { priority: 'urgent', createdAt: { $lt: new Date(urgentThreshold) } },
      { priority: 'high', createdAt: { $lt: new Date(highThreshold) } },
      { priority: 'normal', createdAt: { $lt: new Date(normalThreshold) } },
      { priority: 'low', createdAt: { $lt: new Date(lowThreshold) } },
    ],
  })
    .populate('clubId', 'name profilePicture')
    .populate('requestedBy', 'name email role')
    .populate('assignedTo', 'name email role')
    .sort({ priority: -1, createdAt: 1 });
};

// Static method to find expired requests
publicPostRequestSchema.statics.findExpired = function() {
  return this.find({
    status: 'pending',
    expiresAt: { $lt: new Date() },
  })
    .populate('clubId', 'name profilePicture')
    .populate('requestedBy', 'name email role');
};

// Static method to find requests requiring follow-up
publicPostRequestSchema.statics.findRequiringFollowUp = function() {
  const now = new Date();
  return this.find({
    requiresFollowUp: true,
    followUpDate: { $lte: now },
    status: { $in: ['pending', 'under_review'] },
  })
    .populate('clubId', 'name profilePicture')
    .populate('requestedBy', 'name email role')
    .populate('assignedTo', 'name email role')
    .sort({ followUpDate: 1 });
};

// Instance method to assign to moderator
publicPostRequestSchema.methods.assignTo = function(moderatorId) {
  this.assignedTo = moderatorId;
  this.status = 'under_review';
  
  this.moderationHistory.push({
    action: 'assigned',
    moderatorId,
    timestamp: new Date(),
    notes: 'Request assigned for review',
  });
  
  return this.save();
};

// Instance method to approve request
publicPostRequestSchema.methods.approve = function(moderatorId, notes = '', scheduledFor = null) {
  this.status = 'approved';
  this.reviewedBy = moderatorId;
  this.reviewedAt = new Date();
  this.reviewNotes = notes;
  this.approvedAt = new Date();
  
  if (scheduledFor) {
    this.scheduledFor = scheduledFor;
    this.isScheduled = true;
  }
  
  this.moderationHistory.push({
    action: 'approved',
    moderatorId,
    timestamp: new Date(),
    notes: notes || 'Request approved',
  });
  
  return this.save();
};

// Instance method to reject request
publicPostRequestSchema.methods.reject = function(moderatorId, reason, notes = '') {
  this.status = 'rejected';
  this.reviewedBy = moderatorId;
  this.reviewedAt = new Date();
  this.rejectionReason = reason;
  this.rejectedAt = new Date();
  this.reviewNotes = notes;
  
  this.moderationHistory.push({
    action: 'rejected',
    moderatorId,
    timestamp: new Date(),
    reason,
    notes: notes || 'Request rejected',
  });
  
  return this.save();
};

// Instance method to schedule for later
publicPostRequestSchema.methods.schedule = function(moderatorId, scheduledFor, notes = '') {
  this.status = 'approved';
  this.reviewedBy = moderatorId;
  this.reviewedAt = new Date();
  this.scheduledFor = scheduledFor;
  this.isScheduled = true;
  this.approvedAt = new Date();
  
  this.moderationHistory.push({
    action: 'scheduled',
    moderatorId,
    timestamp: new Date(),
    notes: notes || `Scheduled for ${scheduledFor}`,
  });
  
  return this.save();
};

// Instance method to add review notes
publicPostRequestSchema.methods.addReviewNotes = function(moderatorId, notes) {
  this.reviewNotes = notes;
  this.moderationHistory.push({
    action: 'reviewed',
    moderatorId,
    timestamp: new Date(),
    notes,
  });
  
  return this.save();
};

// Instance method to schedule follow-up
publicPostRequestSchema.methods.scheduleFollowUp = function(date, notes = '') {
  this.requiresFollowUp = true;
  this.followUpDate = date;
  this.followUpNotes = notes;
  return this.save();
};

// Instance method to link approved post
publicPostRequestSchema.methods.linkApprovedPost = function(postId) {
  this.approvedPostId = postId;
  return this.save();
};

// Instance method to get public info (for club members)
publicPostRequestSchema.methods.getPublicInfo = function() {
  const requestObject = this.toObject();
  
  // Remove sensitive fields
  delete requestObject.moderationHistory;
  delete requestObject.followUpNotes;
  delete requestObject.reviewNotes;
  
  return requestObject;
};

// Instance method to check if can be edited
publicPostRequestSchema.methods.canBeEdited = function() {
  return this.status === 'pending' && !this.isExpired;
};

// Instance method to check if can be cancelled
publicPostRequestSchema.methods.canBeCancelled = function() {
  return this.status === 'pending' && !this.isExpired;
};

const PublicPostRequest = mongoose.model('PublicPostRequest', publicPostRequestSchema);

module.exports = PublicPostRequest;
