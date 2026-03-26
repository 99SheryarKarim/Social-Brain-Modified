const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: { type: String, required: true },
  profilePic: { type: String },
  about: { type: String },

  socialLinks: {
    twitter: {
      pageId: { type: String },
      accessToken: { type: String },
      accessTokenSecret: { type: String },
    },
    linkedin: {
      accessToken: { type: String },
    },
    facebook: {
      pageId: { type: String },
      accessToken: { type: String },
    },
    instagram: {
      accessToken: { type: String },
    },
  },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
