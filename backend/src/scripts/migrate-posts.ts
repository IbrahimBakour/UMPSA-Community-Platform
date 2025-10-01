/**
 * Migration script to update existing posts to the new schema
 * Run this script after updating the Post model
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import Post from "../models/Post";
import connectDB from "../config/db";

dotenv.config();

async function migratePosts() {
  try {
    console.log("Starting post migration...");
    
    // Connect to database
    await connectDB();
    
    // Get all existing posts
    const posts = await Post.find({});
    console.log(`Found ${posts.length} posts to migrate`);
    
    let migratedCount = 0;
    
    for (const post of posts) {
      const updateData: any = {};
      
      // Set postType based on whether club exists
      if (post.club) {
        updateData.postType = "club";
      } else {
        updateData.postType = "feed";
        // For feed posts without club, we need to set status to approved
        // since they were previously active
        updateData.status = "approved";
      }
      
      // Convert likes to interactions
      const likes = (post as any).likes;
      if (Array.isArray(likes) && likes.length > 0) {
        updateData.interactions = likes.map((userId: any) => ({
          user: userId,
          type: "like"
        }));
      }
      
      // Rename images to media
      const images = (post as any).images;
      if (Array.isArray(images) && images.length > 0) {
        updateData.media = images;
      }
      
      // Convert status from active/archived to approved/rejected
      const status = (post as any).status as "active" | "archived";
      if (status === "active") {
        updateData.status = "approved";
      } else if (status === "archived") {
        updateData.status = "rejected";
      }
      
      // Remove old fields
      const unsetFields: any = {};
      if ((post as any).title) unsetFields.title = 1;
      if ((post as any).images) unsetFields.images = 1;
      if ((post as any).likes) unsetFields.likes = 1;
      if ((post as any).visibility) unsetFields.visibility = 1;
      if ((post as any).viewCount !== undefined) unsetFields.viewCount = 1;
      
      // Update the post
      await Post.findByIdAndUpdate(
        post._id,
        {
          $set: updateData,
          $unset: unsetFields
        }
      );
      
      migratedCount++;
      console.log(`Migrated post ${migratedCount}/${posts.length}: ${post._id}`);
    }
    
    console.log(`Migration completed! Migrated ${migratedCount} posts.`);
    
    // Verify migration
    const feedPosts = await Post.countDocuments({ postType: "feed" });
    const clubPosts = await Post.countDocuments({ postType: "club" });
    const approvedPosts = await Post.countDocuments({ status: "approved" });
    
    console.log(`Verification:`);
    console.log(`- Feed posts: ${feedPosts}`);
    console.log(`- Club posts: ${clubPosts}`);
    console.log(`- Approved posts: ${approvedPosts}`);
    
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migratePosts();
}

export default migratePosts;
