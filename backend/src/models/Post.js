const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  // Basic Information
  content: {
    type: String,
    required: [true, 'Post content is required'],
    trim: true,
    maxlength: [2000, 'Post content cannot exceed 2000 characters'],
  },
  
  // Author Information
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  authorType: {
    type: String,
    enum: ['user', 'club'],
    default: 'user',
    required: true,
  },
  clubId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    // Required only if authorType is 'club'
  },
  
  // Post Type and Visibility
  type: {
    type: String,
    enum: ['text', 'image', 'video', 'event', 'poll', 'announcement'],
    default: 'text',
  },
  isPublic: {
    type: Boolean,
    default: false, // Club posts are private by default
  },
  isApproved: {
    type: Boolean,
    default: true, // Public posts need approval
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  approvedAt: Date,
  
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
    thumbnail: String, // For videos and images
  }],
  
  // Event Information (if type is 'event')
  event: {
    title: String,
    description: String,
    date: Date,
    endDate: Date,
    location: String,
    maxAttendees: Number,
    attendees: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      status: {
        type: String,
        enum: ['going', 'maybe', 'not_going'],
        default: 'going',
      },
      joinedAt: {
        type: Date,
        default: Date.now,
      },
    }],
  },
  
  // Poll Information (if type is 'poll')
  poll: {
    question: String,
    options: [{
      text: String,
      votes: [{
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        votedAt: {
          type: Date,
          default: Date.now,
        },
      }],
    }],
    endsAt: Date,
    allowMultipleVotes: {
      type: Boolean,
      default: false,
    },
  },
  
  // Engagement
  likes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    likedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  comments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    likes: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      likedAt: {
        type: Date,
        default: Date.now,
      },
    }],
  }],
  
  // Moderation and Status
  status: {
    type: String,
    enum: ['active', 'hidden', 'deleted', 'pending_review'],
    default: 'active',
  },
  reportedCount: {
    type: Number,
    default: 0,
  },
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  moderatedAt: Date,
  moderationReason: String,
  
  // Tags and Categories
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters'],
  }],
  
  // Location (if applicable)
  location: {
    type: String,
    trim: true,
  },
  coordinates: {
    latitude: Number,
    longitude: Number,
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
  publishedAt: Date,
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual for like count
postSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count
postSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Virtual for engagement score
postSchema.virtual('engagementScore').get(function() {
  return this.likes.length + (this.comments.length * 2) + (this.reportedCount * -5);
});

// Virtual for checking if post is editable
postSchema.virtual('isEditable').get(function() {
  const now = new Date();
  const postAge = now - this.createdAt;
  return postAge < 24 * 60 * 60 * 1000; // 24 hours
});

// Indexes for better query performance
postSchema.index({ authorId: 1, createdAt: -1 });
postSchema.index({ clubId: 1, createdAt: -1 });
postSchema.index({ isPublic: 1, isApproved: 1, createdAt: -1 });
postSchema.index({ status: 1, createdAt: -1 });
postSchema.index({ type: 1, createdAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ 'event.date': 1 });
postSchema.index({ 'poll.endsAt': 1 });

// Text search index
postSchema.index({ content: 'text', tags: 'text' });

// Pre-save middleware to update timestamps
postSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Set publishedAt if not set and post is being published
  if (!this.publishedAt && this.status === 'active') {
    this.publishedAt = Date.now();
  }
  
  next();
});

// Pre-save middleware to validate club posts
postSchema.pre('save', function(next) {
  if (this.authorType === 'club' && !this.clubId) {
    return next(new Error('Club posts must have a clubId'));
  }
  next();
});

// Static method to find public posts
postSchema.statics.findPublic = function() {
  return this.find({ isPublic: true, isApproved: true, status: 'active' })
    .populate('authorId', 'name avatarUrl role')
    .populate('clubId', 'name profilePicture')
    .sort({ createdAt: -1 });
};

// Static method to find club posts
postSchema.statics.findClubPosts = function(clubId) {
  return this.find({ clubId, status: 'active' })
    .populate('authorId', 'name avatarUrl role')
    .populate('clubId', 'name profilePicture')
    .sort({ createdAt: -1 });
};

// Static method to find user posts
postSchema.statics.findUserPosts = function(userId) {
  return this.find({ authorId: userId, status: 'active' })
    .populate('clubId', 'name profilePicture')
    .sort({ createdAt: -1 });
};

// Static method to find posts by type
postSchema.statics.findByType = function(type) {
  return this.find({ type, status: 'active' })
    .populate('authorId', 'name avatarUrl role')
    .populate('clubId', 'name profilePicture')
    .sort({ createdAt: -1 });
};

// Static method to search posts
postSchema.statics.search = function(query, filters = {}) {
  const searchQuery = {
    $and: [
      { status: 'active' },
      {
        $or: [
          { content: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } },
        ],
      },
    ],
  };
  
  // Apply additional filters
  if (filters.isPublic !== undefined) {
    searchQuery.$and.push({ isPublic: filters.isPublic });
  }
  if (filters.clubId) {
    searchQuery.$and.push({ clubId: filters.clubId });
  }
  if (filters.type) {
    searchQuery.$and.push({ type: filters.type });
  }
  if (filters.authorId) {
    searchQuery.$and.push({ authorId: filters.authorId });
  }
  
  return this.find(searchQuery)
    .populate('authorId', 'name avatarUrl role')
    .populate('clubId', 'name profilePicture')
    .sort({ createdAt: -1 });
};

// Instance method to add like
postSchema.methods.addLike = function(userId) {
  const existingLike = this.likes.find(like => like.userId.toString() === userId.toString());
  if (!existingLike) {
    this.likes.push({ userId, likedAt: new Date() });
    return this.save();
  }
  return Promise.resolve(this);
};

// Instance method to remove like
postSchema.methods.removeLike = function(userId) {
  this.likes = this.likes.filter(like => like.userId.toString() !== userId.toString());
  return this.save();
};

// Instance method to add comment
postSchema.methods.addComment = function(userId, content) {
  this.comments.push({
    userId,
    content,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return this.save();
};

// Instance method to edit comment
postSchema.methods.editComment = function(commentId, userId, newContent) {
  const comment = this.comments.id(commentId);
  if (comment && comment.userId.toString() === userId.toString()) {
    comment.content = newContent;
    comment.updatedAt = new Date();
    comment.isEdited = true;
    return this.save();
  }
  throw new Error('Comment not found or unauthorized');
};

// Instance method to remove comment
postSchema.methods.removeComment = function(commentId, userId) {
  const comment = this.comments.id(commentId);
  if (comment && (comment.userId.toString() === userId.toString() || this.authorId.toString() === userId.toString())) {
    comment.remove();
    return this.save();
  }
  throw new Error('Comment not found or unauthorized');
};

// Instance method to report post
postSchema.methods.report = function() {
  this.reportedCount += 1;
  if (this.reportedCount >= 5) {
    this.status = 'pending_review';
  }
  return this.save();
};

// Instance method to moderate post
postSchema.methods.moderate = function(moderatorId, action, reason) {
  this.moderatedBy = moderatorId;
  this.moderatedAt = new Date();
  this.moderationReason = reason;
  
  switch (action) {
    case 'hide':
      this.status = 'hidden';
      break;
    case 'delete':
      this.status = 'deleted';
      break;
    case 'approve':
      this.status = 'active';
      break;
    default:
      throw new Error('Invalid moderation action');
  }
  
  return this.save();
};

// Instance method to get public info
postSchema.methods.getPublicInfo = function() {
  const postObject = this.toObject();
  
  // Remove sensitive fields
  delete postObject.reportedCount;
  delete postObject.moderatedBy;
  delete postObject.moderatedAt;
  delete postObject.moderationReason;
  
  return postObject;
};

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
