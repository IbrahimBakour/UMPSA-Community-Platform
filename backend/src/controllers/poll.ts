import { Request, Response } from "express";
import Post from "../models/Post";
import User from "../models/User";
import { IUser } from "../models/User";

interface AuthRequest extends Request {
  user?: IUser;
}

interface PaginationQuery {
  page?: string;
  limit?: string;
}

// Create a new poll in a post
export const createPoll = async (req: AuthRequest, res: Response) => {
  try {
    const { postId } = req.params;
    const { question, options, allowMultipleVotes, endDate } = req.body;

    if (!question || !options || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ 
        message: "Question and at least 2 options are required" 
      });
    }

    if (options.length > 10) {
      return res.status(400).json({ 
        message: "Maximum 10 options allowed per poll" 
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user can modify this post
    const isAuthor = String((post as any).author) === String((req.user as any)?._id || "");
    if (!isAuthor && req.user?.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to modify this post" });
    }

    // Check if poll already exists
    if (post.poll) {
      return res.status(400).json({ message: "Poll already exists for this post" });
    }

    // Validate end date
    let pollEndDate;
    if (endDate) {
      pollEndDate = new Date(endDate);
      if (pollEndDate <= new Date()) {
        return res.status(400).json({ 
          message: "End date must be in the future" 
        });
      }
    }

    // Create poll options with initial vote counts
    const pollOptions = options.map((option: string) => ({
      text: option.trim(),
      votes: 0,
      voters: []
    }));

    const poll: any = {
      question: question.trim(),
      options: pollOptions,
      allowMultipleVotes: allowMultipleVotes || false,
      endDate: pollEndDate,
      totalVotes: 0,
      createdAt: new Date(),
      isActive: true,
    };

    post.poll = poll;
    await post.save();

    res.status(201).json({
      message: "Poll created successfully",
      poll: post.poll,
    });
  } catch (error) {
    console.error("Create poll error:", error);
    res.status(500).json({ message: "Error creating poll" });
  }
};

// Vote on a poll
export const votePoll = async (req: AuthRequest, res: Response) => {
  try {
    const { postId } = req.params;
    const { optionIndexes } = req.body; // Array of option indices

    if (!Array.isArray(optionIndexes) || optionIndexes.length === 0) {
      return res.status(400).json({ 
        message: "At least one option must be selected" 
      });
    }

    const post = await Post.findById(postId);
    if (!post || !post.poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    // Check if poll is still active
    if (!(post.poll as any)?.isActive || ((post.poll as any)?.endDate && new Date() > (post.poll as any).endDate)) {
      return res.status(400).json({ message: "Poll is no longer active" });
    }

    // Validate option indexes
    for (const index of optionIndexes) {
      if (index < 0 || index >= post.poll.options.length) {
        return res.status(400).json({ 
          message: "Invalid option index" 
        });
      }
    }

    // Check if single vote poll and multiple options selected
    if (!(post.poll as any).allowMultipleVotes && optionIndexes.length > 1) {
      return res.status(400).json({ 
        message: "Multiple votes not allowed for this poll" 
      });
    }

    // Check if user has already voted
    const userId = String((req.user as any)?._id || "");
    const hasVoted = (post.poll.options as any[]).some((option: any) => 
      Array.isArray(option.voters) && option.voters.includes(userId)
    );

    if (hasVoted) {
      return res.status(400).json({ message: "You have already voted in this poll" });
    }

    // Record votes
    for (const index of optionIndexes) {
      (post.poll.options[index] as any).votes += 1;
      (post.poll.options[index] as any).voters = Array.isArray((post.poll.options[index] as any).voters)
        ? (post.poll.options[index] as any).voters
        : [];
      (post.poll.options[index] as any).voters.push(userId);
    }

    (post.poll as any).totalVotes = ((post.poll as any).totalVotes || 0) + optionIndexes.length;
    await post.save();

    res.json({
      message: "Vote recorded successfully",
      poll: post.poll,
    });
  } catch (error) {
    console.error("Vote poll error:", error);
    res.status(500).json({ message: "Error recording vote" });
  }
};

// Get poll results
export const getPollResults = async (req: AuthRequest, res: Response) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId).populate("author", "studentId nickname");
    if (!post || !post.poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    // Check if poll has ended
    const isPollEnded = (post.poll as any).endDate && new Date() > (post.poll as any).endDate;
    
    // Calculate percentages
    const pollResults: any = {
      ...(post.poll as any),
      isPollEnded,
      optionsWithPercentages: (post.poll.options as any[]).map((option: any) => ({
        ...option,
        percentage: ((post.poll as any).totalVotes || 0) > 0 
          ? ((option.votes / (post.poll as any).totalVotes) * 100).toFixed(1)
          : "0.0"
      })),
      hasUserVoted: req.user ? (post.poll.options as any[]).some((option: any) => 
        Array.isArray(option.voters) && option.voters.includes(String((req.user as any)!._id))
      ) : false,
      userVotes: req.user ? (post.poll.options as any[])
        .map((option: any, index: number) => ({
          optionIndex: index,
          voted: Array.isArray(option.voters) && option.voters.includes(String((req.user as any)!._id))
        }))
        .filter(vote => vote.voted)
        .map(vote => vote.optionIndex)
      : []
    };

    res.json({
      poll: pollResults,
      postInfo: {
        _id: post._id,
        content: post.content,
        author: post.author,
        postType: post.postType,
        createdAt: post.createdAt,
      }
    });
  } catch (error) {
    console.error("Get poll results error:", error);
    res.status(500).json({ message: "Error fetching poll results" });
  }
};

// Update poll (author/admin only)
export const updatePoll = async (req: AuthRequest, res: Response) => {
  try {
    const { postId } = req.params;
    const { question, options, allowMultipleVotes, endDate, isActive } = req.body;

    const post = await Post.findById(postId);
    if (!post || !post.poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    // Check if user can modify this post
    if (String((post as any).author) !== String((req.user as any)?._id || "") && req.user?.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to modify this poll" });
    }

    // Check if poll has votes (can't modify options if votes exist)
    if (((post.poll as any).totalVotes || 0) > 0 && options) {
      return res.status(400).json({ 
        message: "Cannot modify poll options after votes have been cast" 
      });
    }

    // Update poll fields
    if (question) (post.poll as any).question = question.trim();
    if (allowMultipleVotes !== undefined) (post.poll as any).allowMultipleVotes = allowMultipleVotes;
    if (isActive !== undefined) (post.poll as any).isActive = isActive;
    
    if (endDate) {
      const pollEndDate = new Date(endDate);
      if (pollEndDate <= new Date()) {
        return res.status(400).json({ 
          message: "End date must be in the future" 
        });
      }
      (post.poll as any).endDate = pollEndDate;
    }

    // Update options (only if no votes exist)
    if (options && Array.isArray(options) && ((post.poll as any).totalVotes || 0) === 0) {
      if (options.length < 2 || options.length > 10) {
        return res.status(400).json({ 
          message: "Poll must have between 2 and 10 options" 
        });
      }

      (post.poll as any).options = options.map((option: string) => ({
        text: option.trim(),
        votes: 0,
        voters: []
      }));
    }

    await post.save();

    res.json({
      message: "Poll updated successfully",
      poll: post.poll,
    });
  } catch (error) {
    console.error("Update poll error:", error);
    res.status(500).json({ message: "Error updating poll" });
  }
};

// Delete poll (author/admin only)
export const deletePoll = async (req: AuthRequest, res: Response) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post || !post.poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    // Check if user can modify this post
    if (String((post as any).author) !== String((req.user as any)?._id || "") && req.user?.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this poll" });
    }

    (post as any).poll = undefined;
    await post.save();

    res.json({ message: "Poll deleted successfully" });
  } catch (error) {
    console.error("Delete poll error:", error);
    res.status(500).json({ message: "Error deleting poll" });
  }
};

// Get all polls with pagination and filters
export const getAllPolls = async (
  req: AuthRequest & { query: PaginationQuery & { 
    status?: string; 
    authorId?: string; 
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }},
  res: Response
) => {
  try {
    const page = parseInt(req.query.page || "1");
    const limit = parseInt(req.query.limit || "10");
    const skip = (page - 1) * limit;
    const { status, authorId, search, sortBy = "createdAt", sortOrder = "desc" } = req.query;

    // Build query
    const query: any = { poll: { $exists: true } };

    // Filter by status
    if (status === "active") {
      query["poll.isActive"] = true;
      query["poll.endDate"] = { $or: [{ $exists: false }, { $gt: new Date() }] };
    } else if (status === "ended") {
      query["poll.endDate"] = { $lte: new Date() };
    }

    // Filter by author
    if (authorId) {
      query.author = authorId;
    }

    // Search in poll question
    if (search) {
      query["poll.question"] = { $regex: search, $options: "i" };
    }

    // Build sort object
    const sort: any = {};
    if (sortBy === "votes") {
      sort["poll.totalVotes"] = sortOrder === "desc" ? -1 : 1;
    } else if (sortBy === "endDate") {
      sort["poll.endDate"] = sortOrder === "desc" ? -1 : 1;
    } else {
      sort[sortBy] = sortOrder === "desc" ? -1 : 1;
    }

    const [polls, total] = await Promise.all([
      Post.find(query)
        .populate("author", "studentId nickname profilePicture")
        .populate("club", "name")
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Post.countDocuments(query),
    ]);

    // Format polls with additional info
    const formattedPolls = polls.map(post => ({
      _id: post._id,
      content: post.content,
      author: post.author,
      club: post.club,
      postType: post.postType,
      poll: {
        ...(post.poll as any),
        isPollEnded: (post.poll as any)?.endDate && new Date() > (post.poll as any).endDate,
        hasUserVoted: req.user ? ((post.poll as any)?.options || []).some((option: any) => 
          Array.isArray(option.voters) && option.voters.includes(String((req.user as any)!._id))
        ) : false,
      },
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    }));

    res.json({
      polls: formattedPolls,
      pagination: {
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        totalPolls: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Get all polls error:", error);
    res.status(500).json({ message: "Error fetching polls" });
  }
};

// Get poll analytics (admin only)
export const getPollAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admins only" });
    }

    const days = parseInt((req.query.days as string) || "30");
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Basic poll statistics
    const [totalPolls, activePolls, endedPolls, totalVotes] = await Promise.all([
      Post.countDocuments({ poll: { $exists: true } }),
      Post.countDocuments({ 
        "poll.isActive": true,
        $or: [
          { "poll.endDate": { $exists: false } },
          { "poll.endDate": { $gt: new Date() } }
        ]
      }),
      Post.countDocuments({ 
        "poll.endDate": { $lte: new Date() } 
      }),
      Post.aggregate([
        { $match: { poll: { $exists: true } } },
        { $group: { _id: null, total: { $sum: "$poll.totalVotes" } } }
      ])
    ]);

    // Poll creation trends
    const creationTrends = await Post.aggregate([
      {
        $match: {
          poll: { $exists: true },
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          count: { $sum: 1 },
          totalVotes: { $sum: "$poll.totalVotes" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ]);

    // Most popular polls
    const popularPolls = await Post.aggregate([
      { $match: { poll: { $exists: true } } },
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author"
        }
      },
      { $unwind: "$author" },
      {
        $project: {
          _id: 1,
          content: { $substr: ["$content", 0, 100] },
          pollQuestion: "$poll.question",
          totalVotes: "$poll.totalVotes",
          optionsCount: { $size: "$poll.options" },
          author: {
            studentId: 1,
            nickname: 1
          },
          createdAt: 1,
          postType: 1
        }
      },
      { $sort: { totalVotes: -1 } },
      { $limit: 10 }
    ]);

    // Vote distribution by post type
    const voteDistribution = await Post.aggregate([
      { $match: { poll: { $exists: true } } },
      {
        $group: {
          _id: "$postType",
          pollCount: { $sum: 1 },
          totalVotes: { $sum: "$poll.totalVotes" },
          avgVotesPerPoll: { $avg: "$poll.totalVotes" }
        }
      }
    ]);

    // Recent poll activity
    const recentActivity = await Post.aggregate([
      {
        $match: {
          poll: { $exists: true },
          createdAt: { $gte: startDate }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author"
        }
      },
      { $unwind: "$author" },
      {
        $project: {
          _id: 1,
          pollQuestion: "$poll.question",
          totalVotes: "$poll.totalVotes",
          author: {
            studentId: 1,
            nickname: 1
          },
          createdAt: 1,
          postType: 1
        }
      },
      { $sort: { createdAt: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      period: {
        days,
        startDate,
        endDate: new Date()
      },
      overview: {
        totalPolls,
        activePolls,
        endedPolls,
        totalVotes: totalVotes[0]?.total || 0
      },
      trends: {
        creationTrends,
        voteDistribution
      },
      popular: {
        mostPopularPolls: popularPolls,
        recentActivity
      }
    });
  } catch (error) {
    console.error("Get poll analytics error:", error);
    res.status(500).json({ message: "Error fetching poll analytics" });
  }
};

// Get user's poll voting history
export const getUserPollHistory = async (
  req: AuthRequest & { query: PaginationQuery },
  res: Response
) => {
  try {
    const page = parseInt(req.query.page || "1");
    const limit = parseInt(req.query.limit || "10");
    const skip = (page - 1) * limit;

    const userId = String((req.user as any)?._id || "");

    // Find polls where user has voted
    const polls = await Post.aggregate([
      {
        $match: {
          poll: { $exists: true },
          "poll.options.voters": userId
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author"
        }
      },
      { $unwind: "$author" },
      {
        $addFields: {
          userVotes: {
            $map: {
              input: "$poll.options",
              as: "option",
              in: {
                text: "$$option.text",
                voted: { $in: [userId, "$$option.voters"] },
                votes: "$$option.votes"
              }
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          content: 1,
          poll: {
            question: 1,
            totalVotes: 1,
            allowMultipleVotes: 1,
            endDate: 1,
            isActive: 1,
            createdAt: 1
          },
          userVotes: 1,
          author: {
            studentId: 1,
            nickname: 1
          },
          postType: 1,
          createdAt: 1
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]);

    const total = await Post.countDocuments({
      poll: { $exists: true },
      "poll.options.voters": userId
    });

    res.json({
      polls,
      pagination: {
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        totalPolls: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error("Get user poll history error:", error);
    res.status(500).json({ message: "Error fetching user poll history" });
  }
};
