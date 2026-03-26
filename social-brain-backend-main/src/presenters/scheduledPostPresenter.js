// presenters/scheduledPostPresenter.js

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
    const mediaUploads = await Promise.all(
      mediaFiles.map(async (file) => {
        const type = file.mimetype.startsWith("video/") ? "video" : "image";
        const uploadResult = await uploadToCloudinary(file.buffer, type);
        return {
          url: uploadResult.secure_url,
          public_id: uploadResult.public_id,
          resource_type: type,
        };
      })
    );

    const scheduledPost = new ScheduledPost({
      userId,
      content: postData.content,
      scheduledTime: postData.scheduledTime,
      media: mediaUploads,
      status: "pending",
    });

    await scheduledPost.save();
    return scheduledPost;
  } catch (error) {
    throw error;
  }
}

// get user scheduled posts
const getUserScheduledPosts = async (userId) => {
  console.log("Fetching scheduled posts for user:", userId);
  return await ScheduledPost.find({ userId }).sort({ scheduledTime: -1 });
};

module.exports = {
  createScheduledPost,
  getUserScheduledPosts,
};
