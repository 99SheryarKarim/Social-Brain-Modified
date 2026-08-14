// presenters/postPresenter.js
const cloudinary = require("cloudinary").v2;
const Post = require("../models/PostedPost");

async function createPost(postData, mediaFiles) {
  const uploadPromises = mediaFiles.map(
    (file) =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "auto" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(file.buffer);
      })
  );Post

  const uploadedMedia = await Promise.all(uploadPromises);

  const mediaInfo = uploadedMedia.map((media) => ({
    url: media.secure_url,
    publicId: media.public_id,
    resourceType: media.resource_type,
  }));

  const newPost = new Post({
    ...postData,
    media: mediaInfo,
  });

  return await newPost.save();
}


const getUserPosts = async (userId) => {
  return await Post.find({ userId }).sort({ createdAt: -1 });
};

module.exports = { createPost, getUserPosts };
