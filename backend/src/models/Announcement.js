const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Announcement title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  body: {
    type: String,
    required: [true, 'Announcement body is required'],
    trim: true,
    maxlength: [2000, 'Body cannot exceed 2000 characters'],
  },
  
  // Author and Ownership
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  authorType: {
    type: String,
    enum: ['admin', 'system', 'club'],
    default: 'admin',
  },
  clubId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    // Required only if authorType is 'club'
  },
  
  // Content and Media
  summary: {
    type: String,
    trim: true,
    maxlength: [500, 'Summary cannot exceed 500 characters'],
  },
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
  
  // Targeting and Visibility
  targetAudience: [{
    type: String,
    enum: ['all', 'students', 'club_members', 'admins', 'specific_clubs', 'specific_faculties'],
    default: ['all'],
  }],
  specificClubs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
  }],
  specificFaculties: [String],
  
  // Priority and Status
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal',
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'scheduled', 'archived', 'expired'],
    default: 'draft',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  
  // Scheduling
  publishedAt: Date,
  scheduledFor: Date,
  expiresAt: Date,
  isScheduled: {
    type: Boolean,
    default: false,
  },
  
  // Engagement and Analytics
  views: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    viewedAt: {
      type: Date,
      default: Date.now,
    },
    ipAddress: String,
    userAgent: String,
  }],
  acknowledgments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    acknowledgedAt: {
      type: Date,
      default: Date.now,
    },
    method: {
      type: String,
      enum: ['read', 'clicked', 'dismissed'],
      default: 'read',
    },
  }],
  
  // Categories and Tags
  category: {
    type: String,
    enum: ['general', 'academic', 'events', 'safety', 'maintenance', 'achievements', 'reminders'],
    default: 'general',
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters'],
  }],
  
  // Moderation and Approval
  requiresApproval: {
    type: Boolean,
    default: false,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  approvedAt: Date,
  approvalNotes: String,
  
  // Publishing Workflow
  publishHistory: [{
    action: {
      type: String,
      enum: ['created', 'submitted', 'approved', 'published', 'scheduled', 'archived'],
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    notes: String,
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
  
  // SEO and Metadata
  slug: {
    type: String,
    unique: true,
    sparse: true,
  },
  metaDescription: {
    type: String,
    maxlength: [160, 'Meta description cannot exceed 160 characters'],
  },
  keywords: [String],
  
  // Follow-up and Actions
  requiresFollowUp: {
    type: Boolean,
    default: false,
  },
  followUpDate: Date,
  followUpNotes: String,
  followUpActions: [{
    action: String,
    completed: Boolean,
    completedAt: Date,
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  }],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual for view count
announcementSchema.virtual('viewCount').get(function() {
  return this.views.length;
});

// Virtual for acknowledgment count
announcementSchema.virtual('acknowledgmentCount').get(function() {
  return this.acknowledgments.length;
});

// Virtual for engagement rate
announcementSchema.virtual('engagementRate').get(function() {
  if (this.viewCount === 0) return 0;
  return Math.round((this.acknowledgmentCount / this.viewCount) * 100);
});

// Virtual for checking if announcement is expired
announcementSchema.virtual('isExpired').get(function() {
  if (!this.expiresAt) return false;
  return Date.now() > this.expiresAt;
});

// Virtual for checking if announcement is scheduled
announcementSchema.virtual('isScheduled').get(function() {
  return this.status === 'scheduled' && this.scheduledFor && Date.now() < this.scheduledFor;
});

// Virtual for checking if announcement is overdue for follow-up
announcementSchema.virtual('isOverdueForFollowUp').get(function() {
  if (!this.requiresFollowUp || !this.followUpDate) return false;
  return Date.now() > this.followUpDate;
});

// Indexes for better query performance
announcementSchema.index({ status: 1, isActive: 1, publishedAt: -1 });
announcementSchema.index({ targetAudience: 1, status: 1 });
announcementSchema.index({ category: 1, status: 1 });
announcementSchema.index({ priority: 1, publishedAt: -1 });
announcementSchema.index({ authorId: 1, createdAt: -1 });
announcementSchema.index({ clubId: 1, status: 1 });
announcementSchema.index({ scheduledFor: 1, status: 1 });
announcementSchema.index({ expiresAt: 1, status: 1 });
announcementSchema.index({ requiresFollowUp: 1, followUpDate: 1 });

// Text search index
announcementSchema.index({ title: 'text', body: 'text', summary: 'text', tags: 'text' });

// Pre-save middleware to update timestamps
announcementSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Generate slug if not provided
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  
  // Set publishedAt if status is being changed to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = Date.now();
  }
  
  // Add to publish history if this is a new announcement
  if (this.isNew) {
    this.publishHistory.push({
      action: 'created',
      userId: this.authorId,
      timestamp: new Date(),
      notes: 'Announcement created',
    });
  }
  
  next();
});

// Pre-save middleware to validate club announcements
announcementSchema.pre('save', function(next) {
  if (this.authorType === 'club' && !this.clubId) {
    return next(new Error('Club announcements must have a clubId'));
  }
  next();
});

// Static method to find published announcements
announcementSchema.statics.findPublished = function() {
  return this.find({ status: 'published', isActive: true })
    .populate('authorId', 'name avatarUrl role')
    .populate('clubId', 'name profilePicture')
    .sort({ publishedAt: -1 });
};

// Static method to find active announcements
announcementSchema.statics.findActive = function() {
  const now = new Date();
  return this.find({
    status: 'published',
    isActive: true,
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: now } },
    ],
  })
    .populate('authorId', 'name avatarUrl role')
    .populate('clubId', 'name profilePicture')
    .sort({ priority: -1, publishedAt: -1 });
};

// Static method to find announcements by category
announcementSchema.statics.findByCategory = function(category) {
  return this.find({ category, status: 'published', isActive: true })
    .populate('authorId', 'name avatarUrl role')
    .populate('clubId', 'name profilePicture')
    .sort({ publishedAt: -1 });
};

// Static method to find announcements by target audience
announcementSchema.statics.findByTargetAudience = function(audience) {
  return this.find({
    $or: [
      { targetAudience: 'all' },
      { targetAudience: audience },
    ],
    status: 'published',
    isActive: true,
  })
    .populate('authorId', 'name avatarUrl role')
    .populate('clubId', 'name profilePicture')
    .sort({ priority: -1, publishedAt: -1 });
};

// Static method to find scheduled announcements
announcementSchema.statics.findScheduled = function() {
  const now = new Date();
  return this.find({
    status: 'scheduled',
    scheduledFor: { $gt: now },
    isActive: true,
  })
    .populate('authorId', 'name avatarUrl role')
    .populate('clubId', 'name profilePicture')
    .sort({ scheduledFor: 1 });
};

// Static method to find expired announcements
announcementSchema.statics.findExpired = function() {
  const now = new Date();
  return this.find({
    expiresAt: { $lt: now },
    status: 'published',
    isActive: true,
  })
    .populate('authorId', 'name avatarUrl role')
    .populate('clubId', 'name profilePicture');
};

// Static method to find announcements requiring follow-up
announcementSchema.statics.findRequiringFollowUp = function() {
  const now = new Date();
  return this.find({
    requiresFollowUp: true,
    followUpDate: { $lte: now },
    status: { $in: ['published', 'scheduled'] },
  })
    .populate('authorId', 'name avatarUrl role')
    .populate('clubId', 'name profilePicture')
    .sort({ followUpDate: 1 });
};

// Static method to search announcements
announcementSchema.statics.search = function(query, filters = {}) {
  const searchQuery = {
    $and: [
      { status: 'published', isActive: true },
      {
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { body: { $regex: query, $options: 'i' } },
          { summary: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } },
        ],
      },
    ],
  };
  
  // Apply additional filters
  if (filters.category) {
    searchQuery.$and.push({ category: filters.category });
  }
  if (filters.targetAudience) {
    searchQuery.$and.push({ targetAudience: filters.targetAudience });
  }
  if (filters.priority) {
    searchQuery.$and.push({ priority: filters.priority });
  }
  if (filters.authorId) {
    searchQuery.$and.push({ authorId: filters.authorId });
  }
  if (filters.clubId) {
    searchQuery.$and.push({ clubId: filters.clubId });
  }
  
  return this.find(searchQuery)
    .populate('authorId', 'name avatarUrl role')
    .populate('clubId', 'name profilePicture')
    .sort({ priority: -1, publishedAt: -1 });
};

// Instance method to publish announcement
announcementSchema.methods.publish = function(userId, notes = '') {
  this.status = 'published';
  this.publishedAt = new Date();
  this.isActive = true;
  
  this.publishHistory.push({
    action: 'published',
    userId,
    timestamp: new Date(),
    notes: notes || 'Announcement published',
  });
  
  return this.save();
};

// Instance method to schedule announcement
announcementSchema.methods.schedule = function(scheduledFor, userId, notes = '') {
  this.status = 'scheduled';
  this.scheduledFor = scheduledFor;
  this.isActive = true;
  
  this.publishHistory.push({
    action: 'scheduled',
    userId,
    timestamp: new Date(),
    notes: notes || `Scheduled for ${scheduledFor}`,
  });
  
  return this.save();
};

// Instance method to archive announcement
announcementSchema.methods.archive = function(userId, notes = '') {
  this.status = 'archived';
  this.isActive = false;
  
  this.publishHistory.push({
    action: 'archived',
    userId,
    timestamp: new Date(),
    notes: notes || 'Announcement archived',
  });
  
  return this.save();
};

// Instance method to add view
announcementSchema.methods.addView = function(userId, ipAddress = '', userAgent = '') {
  const existingView = this.views.find(view => 
    view.userId && view.userId.toString() === userId.toString()
  );
  
  if (!existingView) {
    this.views.push({
      userId,
      viewedAt: new Date(),
      ipAddress,
      userAgent,
    });
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Instance method to add acknowledgment
announcementSchema.methods.addAcknowledgment = function(userId, method = 'read') {
  const existingAck = this.acknowledgments.find(ack => 
    ack.userId.toString() === userId.toString()
  );
  
  if (!existingAck) {
    this.acknowledgments.push({
      userId,
      acknowledgedAt: new Date(),
      method,
    });
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Instance method to approve announcement
announcementSchema.methods.approve = function(moderatorId, notes = '') {
  this.requiresApproval = false;
  this.approvedBy = moderatorId;
  this.approvedAt = new Date();
  this.approvalNotes = notes;
  
  this.publishHistory.push({
    action: 'approved',
    userId: moderatorId,
    timestamp: new Date(),
    notes: notes || 'Announcement approved',
  });
  
  return this.save();
};

// Instance method to schedule follow-up
announcementSchema.methods.scheduleFollowUp = function(date, notes = '') {
  this.requiresFollowUp = true;
  this.followUpDate = date;
  this.followUpNotes = notes;
  return this.save();
};

// Instance method to add follow-up action
announcementSchema.methods.addFollowUpAction = function(action) {
  this.followUpActions.push({
    action,
    completed: false,
  });
  return this.save();
};

// Instance method to complete follow-up action
announcementSchema.methods.completeFollowUpAction = function(actionIndex, userId) {
  if (this.followUpActions[actionIndex]) {
    this.followUpActions[actionIndex].completed = true;
    this.followUpActions[actionIndex].completedAt = new Date();
    this.followUpActions[actionIndex].completedBy = userId;
    return this.save();
  }
  throw new Error('Follow-up action not found');
};

// Instance method to get public info
announcementSchema.methods.getPublicInfo = function() {
  const announcementObject = this.toObject();
  
  // Remove sensitive fields
  delete announcementObject.publishHistory;
  delete announcementObject.followUpNotes;
  delete announcementObject.followUpActions;
  delete announcementObject.approvalNotes;
  
  return announcementObject;
};

const Announcement = mongoose.model('Announcement', announcementSchema);

module.exports = Announcement;
