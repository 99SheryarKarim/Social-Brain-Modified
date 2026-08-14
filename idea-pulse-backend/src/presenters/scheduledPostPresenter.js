// presenters/scheduledPostPresenter.js - SQLite version

const ScheduledPost = require("../models/ScheduledPost");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const uploadToCloudinary = (fileBuffer, resourceType = "image") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: resourceType, folder: "scheduled_posts" },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

async function createScheduledPost(postData, mediaFiles, userId) {
  try {
    const mediaUploads = mediaFiles && mediaFiles.length > 0
      ? await Promise.all(
          mediaFiles.map(async (file) => {
            const type = file.mimetype.startsWith("video/") ? "video" : "image";
            const uploadResult = await uploadToCloudinary(file.buffer, type);
            return {
              url: uploadResult.secure_url,
              public_id: uploadResult.public_id,
              resource_type: type,
            };
          })
        )
      : [];

    const scheduledPost = await ScheduledPost.create(
      userId,
      postData.content,
      postData.scheduledTime,
      postData.platform || 'facebook'
    );

    return {
      ...scheduledPost,
      media: mediaUploads,
      status: "pending",
    };
  } catch (error) {
    throw error;
  }
}

// get user scheduled posts
const getUserScheduledPosts = async (userId) => {
  console.log("Fetching scheduled posts for user:", userId);
  const posts = await ScheduledPost.findByUserId(userId);
  return posts.map(post => ({
    ...post,
    status: 'scheduled',
    engagement: 0,
    platform: post.platform || 'facebook',
  }));
};

module.exports = {
  createScheduledPost,
  getUserScheduledPosts,
};
