// models/ScheduledPost.js (Mongoose example)

const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema({
  url: String,
  public_id: String,
  resource_type: { type: String, enum: ["image", "video"], default: "image" },
});

const scheduledPostSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  content: { type: String, required: true },
  scheduledTime: { type: Date, required: true },
  media: [mediaSchema],
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ScheduledPost", scheduledPostSchema);
