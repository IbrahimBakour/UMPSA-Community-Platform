const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  // Report Information
  reason: {
    type: String,
    required: [true, 'Report reason is required'],
    trim: true,
    maxlength: [200, 'Report reason cannot exceed 200 characters'],
  },
  description: {
    type: String,
    required: [true, 'Report description is required'],
    trim: true,
    maxlength: [1000, 'Report description cannot exceed 1000 characters'],
  },
  
  // Report Category and Priority
  category: {
    type: String,
    enum: ['inappropriate_content', 'harassment', 'spam', 'fake_news', 'copyright', 'other'],
    required: true,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  
  // Reporter Information
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  // Target Information
  targetType: {
    type: String,
    enum: ['user', 'post', 'club', 'comment', 'event'],
    required: true,
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    // This will reference different models based on targetType
  },
  
  // Target Details (for quick access)
  targetDetails: {
    name: String, // User name, post content preview, club name, etc.
    type: String, // Additional context about the target
    url: String,  // Link to the reported content
  },
  
  // Assignment and Status
  status: {
    type: String,
    enum: ['pending', 'investigating', 'resolved', 'dismissed', 'escalated'],
    default: 'pending',
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // Admin assigned to handle this report
  },
  
  // Resolution Information
  resolution: {
    action: {
      type: String,
      enum: ['no_action', 'warn', 'suspend', 'ban', 'remove_content', 'escalate'],
      default: 'no_action',
    },
    duration: Number, // Suspension duration in days
    reason: String,   // Why this action was taken
    notes: String,    // Additional notes from moderator
  },
  
  // Moderation Actions
  actions: [{
    action: {
      type: String,
      enum: ['warn', 'suspend', 'ban', 'remove_content', 'edit_content', 'escalate'],
      required: true,
    },
    moderatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    reason: String,
    duration: Number, // For suspensions/bans
    notes: String,
  }],
  
  // Investigation Details
  investigation: {
    startedAt: Date,
    completedAt: Date,
    findings: String,
    evidence: [{
      type: String,
      description: String,
      url: String,
    }],
    witnesses: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      statement: String,
      timestamp: Date,
    }],
  },
  
  // Escalation Information
  escalatedTo: {
    type: String,
    enum: ['supervisor', 'legal', 'external_authority'],
  },
  escalationReason: String,
  escalationDate: Date,
  
  // Timestamps and Tracking
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  resolvedAt: Date,
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  
  // Response Time Tracking
  firstResponseTime: Date, // When first action was taken
  resolutionTime: Date,   // When report was resolved
  
  // Follow-up
  requiresFollowUp: {
    type: Boolean,
    default: false,
  },
  followUpDate: Date,
  followUpNotes: String,
  
  // Tags for categorization
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters'],
  }],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual for report age
reportSchema.virtual('age').get(function() {
  return Date.now() - this.createdAt;
});

// Virtual for response time
reportSchema.virtual('responseTime').get(function() {
  if (this.firstResponseTime) {
    return this.firstResponseTime - this.createdAt;
  }
  return null;
});

// Virtual for total resolution time
reportSchema.virtual('totalResolutionTime').get(function() {
  if (this.resolvedAt) {
    return this.resolvedAt - this.createdAt;
  }
  return null;
});

// Virtual for checking if report is overdue
reportSchema.virtual('isOverdue').get(function() {
  const now = Date.now();
  const reportAge = now - this.createdAt;
  
  // Different thresholds based on priority
  const thresholds = {
    urgent: 2 * 60 * 60 * 1000,      // 2 hours
    high: 24 * 60 * 60 * 1000,       // 24 hours
    medium: 3 * 24 * 60 * 60 * 1000, // 3 days
    low: 7 * 24 * 60 * 60 * 1000,    // 7 days
  };
  
  return reportAge > thresholds[this.priority];
});

// Indexes for better query performance
reportSchema.index({ status: 1, priority: 1, createdAt: -1 });
reportSchema.index({ assignedTo: 1, status: 1 });
reportSchema.index({ reportedBy: 1, createdAt: -1 });
reportSchema.index({ targetType: 1, targetId: 1 });
reportSchema.index({ category: 1, status: 1 });
reportSchema.index({ priority: 1, createdAt: -1 });
reportSchema.index({ requiresFollowUp: 1, followUpDate: 1 });

// Pre-save middleware to update timestamps
reportSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Set first response time if this is the first action
  if (this.actions && this.actions.length === 1 && !this.firstResponseTime) {
    this.firstResponseTime = new Date();
  }
  
  // Set resolution time if status is being changed to resolved
  if (this.isModified('status') && this.status === 'resolved' && !this.resolvedAt) {
    this.resolvedAt = new Date();
  }
  
  next();
});

// Static method to find pending reports
reportSchema.statics.findPending = function() {
  return this.find({ status: 'pending' })
    .populate('reportedBy', 'name email role')
    .populate('assignedTo', 'name email role')
    .sort({ priority: -1, createdAt: 1 });
};

// Static method to find reports by status
reportSchema.statics.findByStatus = function(status) {
  return this.find({ status })
    .populate('reportedBy', 'name email role')
    .populate('assignedTo', 'name email role')
    .sort({ createdAt: -1 });
};

// Static method to find reports by priority
reportSchema.statics.findByPriority = function(priority) {
  return this.find({ priority, status: { $ne: 'resolved' } })
    .populate('reportedBy', 'name email role')
    .populate('assignedTo', 'name email role')
    .sort({ createdAt: 1 });
};

// Static method to find reports by category
reportSchema.statics.findByCategory = function(category) {
  return this.find({ category })
    .populate('reportedBy', 'name email role')
    .populate('assignedTo', 'name email role')
    .sort({ createdAt: -1 });
};

// Static method to find reports by target
reportSchema.statics.findByTarget = function(targetType, targetId) {
  return this.find({ targetType, targetId })
    .populate('reportedBy', 'name email role')
    .populate('assignedTo', 'name email role')
    .sort({ createdAt: -1 });
};

// Static method to find overdue reports
reportSchema.statics.findOverdue = function() {
  const now = Date.now();
  const urgentThreshold = now - (2 * 60 * 60 * 1000);
  const highThreshold = now - (24 * 60 * 60 * 1000);
  const mediumThreshold = now - (3 * 24 * 60 * 60 * 1000);
  const lowThreshold = now - (7 * 24 * 60 * 60 * 1000);
  
  return this.find({
    status: { $in: ['pending', 'investigating'] },
    $or: [
      { priority: 'urgent', createdAt: { $lt: new Date(urgentThreshold) } },
      { priority: 'high', createdAt: { $lt: new Date(highThreshold) } },
      { priority: 'medium', createdAt: { $lt: new Date(mediumThreshold) } },
      { priority: 'low', createdAt: { $lt: new Date(lowThreshold) } },
    ],
  })
    .populate('reportedBy', 'name email role')
    .populate('assignedTo', 'name email role')
    .sort({ priority: -1, createdAt: 1 });
};

// Static method to find reports requiring follow-up
reportSchema.statics.findRequiringFollowUp = function() {
  const now = new Date();
  return this.find({
    requiresFollowUp: true,
    followUpDate: { $lte: now },
    status: { $ne: 'resolved' },
  })
    .populate('reportedBy', 'name email role')
    .populate('assignedTo', 'name email role')
    .sort({ followUpDate: 1 });
};

// Instance method to assign to moderator
reportSchema.methods.assignTo = function(moderatorId) {
  this.assignedTo = moderatorId;
  this.status = 'investigating';
  this.investigation.startedAt = new Date();
  return this.save();
};

// Instance method to add action
reportSchema.methods.addAction = function(action, moderatorId, reason, duration = null, notes = '') {
  this.actions.push({
    action,
    moderatorId,
    timestamp: new Date(),
    reason,
    duration,
    notes,
  });
  
  // Update status based on action
  if (action === 'escalate') {
    this.status = 'escalated';
  } else if (action !== 'warn') {
    this.status = 'resolved';
    this.resolvedAt = new Date();
    this.resolvedBy = moderatorId;
  }
  
  return this.save();
};

// Instance method to resolve report
reportSchema.methods.resolve = function(moderatorId, action, reason, duration = null, notes = '') {
  this.status = 'resolved';
  this.resolvedAt = new Date();
  this.resolvedBy = moderatorId;
  
  this.resolution = {
    action,
    duration,
    reason,
    notes,
  };
  
  // Add the resolution action
  this.actions.push({
    action,
    moderatorId,
    timestamp: new Date(),
    reason,
    duration,
    notes,
  });
  
  return this.save();
};

// Instance method to dismiss report
reportSchema.methods.dismiss = function(moderatorId, reason = '') {
  this.status = 'dismissed';
  this.resolvedAt = new Date();
  this.resolvedBy = moderatorId;
  
  this.resolution = {
    action: 'no_action',
    reason: reason || 'Report dismissed after investigation',
  };
  
  this.actions.push({
    action: 'no_action',
    moderatorId,
    timestamp: new Date(),
    reason: 'Report dismissed',
  });
  
  return this.save();
};

// Instance method to escalate report
reportSchema.methods.escalate = function(moderatorId, escalationType, reason) {
  this.status = 'escalated';
  this.escalatedTo = escalationType;
  this.escalationReason = reason;
  this.escalationDate = new Date();
  
  this.actions.push({
    action: 'escalate',
    moderatorId,
    timestamp: new Date(),
    reason,
  });
  
  return this.save();
};

// Instance method to add investigation finding
reportSchema.methods.addFinding = function(finding) {
  this.investigation.findings = finding;
  return this.save();
};

// Instance method to add evidence
reportSchema.methods.addEvidence = function(type, description, url) {
  this.investigation.evidence.push({
    type,
    description,
    url,
  });
  return this.save();
};

// Instance method to add witness statement
reportSchema.methods.addWitnessStatement = function(userId, statement) {
  this.investigation.witnesses.push({
    userId,
    statement,
    timestamp: new Date(),
  });
  return this.save();
};

// Instance method to schedule follow-up
reportSchema.methods.scheduleFollowUp = function(date, notes = '') {
  this.requiresFollowUp = true;
  this.followUpDate = date;
  this.followUpNotes = notes;
  return this.save();
};

// Instance method to get public info (for reporting user)
reportSchema.methods.getPublicInfo = function() {
  const reportObject = this.toObject();
  
  // Remove sensitive fields
  delete reportObject.actions;
  delete reportObject.investigation;
  delete reportObject.escalatedTo;
  delete reportObject.escalationReason;
  delete reportObject.escalationDate;
  delete reportObject.followUpNotes;
  
  return reportObject;
};

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
