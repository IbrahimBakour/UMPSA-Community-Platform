import { createNotification, createBulkNotifications } from "../controllers/notification";
import { NotificationPriority } from "../models/Notification";

// Notification trigger helpers for different events

// Post-related notifications
export const triggerPostApprovedNotification = async (
  postId: string,
  authorId: string,
  adminId: string
) => {
  try {
    await createNotification(
      "post_approved",
      "Post Approved",
      "Your post has been approved and is now visible to the community.",
      authorId,
      {
        priority: "medium",
        relatedPost: postId,
        relatedUser: adminId,
        data: { action: "approved" }
      }
    );
  } catch (error) {
    console.error("Error creating post approved notification:", error);
  }
};

export const triggerPostRejectedNotification = async (
  postId: string,
  authorId: string,
  adminId: string,
  reason?: string
) => {
  try {
    await createNotification(
      "post_rejected",
      "Post Rejected",
      `Your post has been rejected.${reason ? ` Reason: ${reason}` : ""}`,
      authorId,
      {
        priority: "medium",
        relatedPost: postId,
        relatedUser: adminId,
        data: { action: "rejected", reason }
      }
    );
  } catch (error) {
    console.error("Error creating post rejected notification:", error);
  }
};

export const triggerPostLikedNotification = async (
  postId: string,
  postAuthorId: string,
  likerId: string
) => {
  try {
    // Don't notify if user liked their own post
    if (String(postAuthorId) === String(likerId)) return;

    console.log("Creating post liked notification:", { postId, postAuthorId, likerId });

    await createNotification(
      "post_liked",
      "Post Liked",
      "Someone liked your post.",
      postAuthorId,
      {
        priority: "low",
        relatedPost: postId,
        relatedUser: likerId,
        data: { action: "liked" }
      }
    );

    console.log("Post liked notification created successfully");
  } catch (error) {
    console.error("Error creating post liked notification:", error);
  }
};

export const triggerPostCommentedNotification = async (
  postId: string,
  postAuthorId: string,
  commenterId: string
) => {
  try {
    // Don't notify if user commented on their own post
    if (String(postAuthorId) === String(commenterId)) return;

    await createNotification(
      "post_commented",
      "New Comment",
      "Someone commented on your post.",
      postAuthorId,
      {
        priority: "medium",
        relatedPost: postId,
        relatedUser: commenterId,
        data: { action: "commented" }
      }
    );
  } catch (error) {
    console.error("Error creating post commented notification:", error);
  }
};

export const triggerPollVotedNotification = async (
  postId: string,
  pollAuthorId: string,
  voterId: string
) => {
  try {
    // Don't notify if user voted on their own poll
    if (String(pollAuthorId) === String(voterId)) return;

    await createNotification(
      "poll_voted",
      "Poll Vote",
      "Someone voted on your poll.",
      pollAuthorId,
      {
        priority: "low",
        relatedPost: postId,
        relatedUser: voterId,
        data: { action: "voted" }
      }
    );
  } catch (error) {
    console.error("Error creating poll voted notification:", error);
  }
};

// Club-related notifications
export const triggerClubInvitedNotification = async (
  clubId: string,
  invitedUserId: string,
  inviterId: string
) => {
  try {
    await createNotification(
      "club_invited",
      "Club Invitation",
      "You have been invited to join a club.",
      invitedUserId,
      {
        priority: "high",
        relatedClub: clubId,
        relatedUser: inviterId,
        data: { action: "invited" }
      }
    );
  } catch (error) {
    console.error("Error creating club invited notification:", error);
  }
};

export const triggerClubJoinedNotification = async (
  clubId: string,
  joinedUserId: string,
  clubMembers: string[]
) => {
  try {
    // Notify all club members except the one who joined
    const memberIds = clubMembers.filter(id => String(id) !== String(joinedUserId));
    
    if (memberIds.length > 0) {
      await createBulkNotifications(
        "club_joined",
        "New Club Member",
        "A new member has joined the club.",
        memberIds,
        {
          priority: "low",
          relatedClub: clubId,
          relatedUser: joinedUserId,
          data: { action: "joined" }
        }
      );
    }
  } catch (error) {
    console.error("Error creating club joined notification:", error);
  }
};

export const triggerClubLeftNotification = async (
  clubId: string,
  leftUserId: string,
  clubMembers: string[]
) => {
  try {
    // Notify all remaining club members
    const memberIds = clubMembers.filter(id => String(id) !== String(leftUserId));
    
    if (memberIds.length > 0) {
      await createBulkNotifications(
        "club_left",
        "Member Left Club",
        "A member has left the club.",
        memberIds,
        {
          priority: "low",
          relatedClub: clubId,
          relatedUser: leftUserId,
          data: { action: "left" }
        }
      );
    }
  } catch (error) {
    console.error("Error creating club left notification:", error);
  }
};

// Report-related notifications
export const triggerReportSubmittedNotification = async (
  reportId: string,
  reporterId: string,
  adminIds: string[]
) => {
  try {
    console.log("Creating report submitted notification:", { reportId, reporterId, adminIds });

    await createBulkNotifications(
      "report_submitted",
      "New Report Submitted",
      "A new report has been submitted for review.",
      adminIds,
      {
        priority: "high",
        relatedReport: reportId,
        relatedUser: reporterId,
        data: { action: "submitted" }
      }
    );

    console.log("Report submitted notification created successfully");
  } catch (error) {
    console.error("Error creating report submitted notification:", error);
  }
};

export const triggerReportResolvedNotification = async (
  reportId: string,
  reporterId: string,
  adminId: string
) => {
  try {
    await createNotification(
      "report_resolved",
      "Report Resolved",
      "Your report has been reviewed and resolved.",
      reporterId,
      {
        priority: "medium",
        relatedReport: reportId,
        relatedUser: adminId,
        data: { action: "resolved" }
      }
    );
  } catch (error) {
    console.error("Error creating report resolved notification:", error);
  }
};

// User management notifications
export const triggerUserRestrictedNotification = async (
  restrictedUserId: string,
  adminId: string,
  restrictionType: string,
  duration?: string
) => {
  try {
    await createNotification(
      "user_restricted",
      "Account Restricted",
      `Your account has been restricted (${restrictionType}${duration ? ` for ${duration}` : ""}).`,
      restrictedUserId,
      {
        priority: "urgent",
        relatedUser: adminId,
        data: { action: "restricted", type: restrictionType, duration }
      }
    );
  } catch (error) {
    console.error("Error creating user restricted notification:", error);
  }
};

export const triggerUserUnrestrictedNotification = async (
  unrestrictedUserId: string,
  adminId: string
) => {
  try {
    await createNotification(
      "user_unrestricted",
      "Account Unrestricted",
      "Your account restrictions have been removed.",
      unrestrictedUserId,
      {
        priority: "high",
        relatedUser: adminId,
        data: { action: "unrestricted" }
      }
    );
  } catch (error) {
    console.error("Error creating user unrestricted notification:", error);
  }
};

// System announcements
export const triggerSystemAnnouncement = async (
  title: string,
  message: string,
  recipientIds: string[],
  priority: "low" | "medium" | "high" | "urgent" = "medium",
  expiresAt?: Date
) => {
  try {
    await createBulkNotifications(
      "system_announcement",
      title,
      message,
      recipientIds,
      {
        priority,
        data: { action: "announcement" },
        ...(expiresAt && { expiresAt })
      }
    );
  } catch (error) {
    console.error("Error creating system announcement:", error);
    throw error;
  }
};
