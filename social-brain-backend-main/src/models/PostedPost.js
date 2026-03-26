// models/Post.js
const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema({
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  resourceType: {
    type: String,
    enum: ["image", "video", "raw"],
    default: "image",
  },
});

const postSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  content: { type: String, required: true },
  media: [mediaSchema],
  createdAt: { type: Date, default: Date.now },
  scheduledTime: { type: Date },
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
