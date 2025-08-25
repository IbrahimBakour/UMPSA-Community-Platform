// Success response helper
const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
  const response = {
    success: true,
    message,
    ...(data && { data })
  };

  return res.status(statusCode).json(response);
};

// Error response helper
const errorResponse = (res, message = 'Error occurred', statusCode = 500, details = null) => {
  const response = {
    success: false,
    error: {
      message,
      ...(details && { details })
    }
  };

  return res.status(statusCode).json(response);
};

// Pagination helper
const paginateResponse = (res, data, page, limit, total, message = 'Data retrieved successfully') => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  const response = {
    success: true,
    message,
    data,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null
    }
  };

  return res.status(200).json(response);
};

// Data transformation helpers
const transformUser = (user) => {
  if (!user) return null;
  
  const userObj = user.toObject ? user.toObject() : user;
  
  return {
    id: userObj._id,
    email: userObj.email,
    name: userObj.name,
    role: userObj.role,
    phone: userObj.phone,
    location: userObj.location,
    bio: userObj.bio,
    avatarUrl: userObj.avatarUrl,
    studentId: userObj.studentId,
    faculty: userObj.faculty,
    yearOfStudy: userObj.yearOfStudy,
    isActive: userObj.isActive,
    lastLogin: userObj.lastLogin,
    createdAt: userObj.createdAt,
    updatedAt: userObj.updatedAt
  };
};

const transformClub = (club) => {
  if (!club) return null;
  
  const clubObj = club.toObject ? club.toObject() : club;
  
  return {
    id: clubObj._id,
    name: clubObj.name,
    description: clubObj.description,
    category: clubObj.category,
    profilePicture: clubObj.profilePicture,
    banner: clubObj.banner,
    location: clubObj.location,
    contact: clubObj.contact,
    tags: clubObj.tags,
    memberCount: clubObj.memberCount,
    isActive: clubObj.isActive,
    createdAt: clubObj.createdAt,
    updatedAt: clubObj.updatedAt
  };
};

const transformPost = (post) => {
  if (!post) return null;
  
  const postObj = post.toObject ? post.toObject() : post;
  
  return {
    id: postObj._id,
    content: postObj.content,
    author: postObj.author,
    postType: postObj.postType,
    visibility: postObj.visibility,
    media: postObj.media,
    likes: postObj.likes?.length || 0,
    comments: postObj.comments?.length || 0,
    tags: postObj.tags,
    createdAt: postObj.createdAt,
    updatedAt: postObj.updatedAt
  };
};

// Search and filter helpers
const buildSearchQuery = (searchTerm, searchFields) => {
  if (!searchTerm) return {};
  
  const searchRegex = new RegExp(searchTerm, 'i');
  const searchQuery = {};
  
  searchFields.forEach(field => {
    searchQuery[field] = searchRegex;
  });
  
  return searchQuery;
};

const buildFilterQuery = (filters) => {
  const filterQuery = {};
  
  Object.keys(filters).forEach(key => {
    if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
      if (Array.isArray(filters[key])) {
        filterQuery[key] = { $in: filters[key] };
      } else {
        filterQuery[key] = filters[key];
      }
    }
  });
  
  return filterQuery;
};

// Date helpers
const formatDate = (date) => {
  if (!date) return null;
  
  const d = new Date(date);
  return d.toISOString();
};

const isDateValid = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

// File helpers
const getFileExtension = (filename) => {
  if (!filename) return '';
  return filename.split('.').pop().toLowerCase();
};

const isImageFile = (filename) => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  return imageExtensions.includes(getFileExtension(filename));
};

const isVideoFile = (filename) => {
  const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'];
  return videoExtensions.includes(getFileExtension(filename));
};

module.exports = {
  successResponse,
  errorResponse,
  paginateResponse,
  transformUser,
  transformClub,
  transformPost,
  buildSearchQuery,
  buildFilterQuery,
  formatDate,
  isDateValid,
  getFileExtension,
  isImageFile,
  isVideoFile
};
