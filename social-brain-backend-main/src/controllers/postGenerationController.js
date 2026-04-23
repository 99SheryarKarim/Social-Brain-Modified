const { generateCompletePost, generatePostContent } = require("../services/geminiService");
const { Post, User } = require("../models/databaseModels");

/**
 * Generate a new post based on topic and tone
 * POST /api/posts/generate
 * Body: { topic, tone, numWords }
 */
exports.generatePost = async (req, res) => {
  try {
    const { topic, tone = "casual", numWords = 150 } = req.body;
    const userId = req.user.id; // From auth middleware

    // Validate input
    if (!topic || topic.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Topic is required",
      });
    }

    if (!tone || tone.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Tone is required",
      });
    }

    // Generate post using Gemini
    console.log(`🚀 Generating post for user ${userId}...`);
    const generatedPost = await generateCompletePost(topic, tone, numWords);

    // Save post to database
    const savedPost = await Post.create(
      userId,
      generatedPost.content,
      tone,
      false, // Not posted to Facebook yet
      null
    );

    res.status(200).json({
      success: true,
      message: "Post generated successfully",
      data: {
        postId: savedPost.id,
        content: generatedPost.content,
        hashtags: generatedPost.hashtags,
        imagePrompt: generatedPost.imagePrompt,
        topic: generatedPost.topic,
        tone: generatedPost.tone,
        keywords: generatedPost.keywords,
        createdAt: savedPost.created_at,
      },
    });
  } catch (error) {
    console.error("Error generating post:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to generate post",
    });
  }
};

/**
 * Get all posts for the logged-in user
 * GET /api/posts
 */
exports.getAllPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50, offset = 0 } = req.query;

    const posts = await Post.findByUserId(userId, parseInt(limit), parseInt(offset));
    const stats = await Post.getStats(userId);

    res.status(200).json({
      success: true,
      data: {
        posts,
        stats: {
          totalPosts: stats.totalPosts,
          postedToFacebook: stats.postedToFacebook,
          draftPosts: stats.totalPosts - stats.postedToFacebook,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch posts",
    });
  }
};

/**
 * Get a specific post by ID
 * GET /api/posts/:postId
 */
exports.getPostById = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: "Post not found",
      });
    }

    // Verify ownership
    if (post.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: "You don't have permission to access this post",
      });
    }

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch post",
    });
  }
};

/**
 * Update a post
 * PUT /api/posts/:postId
 * Body: { content, tone }
 */
exports.updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, tone } = req.body;
    const userId = req.user.id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: "Post not found",
      });
    }

    // Verify ownership
    if (post.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: "You don't have permission to update this post",
      });
    }

    const updatedPost = await Post.update(postId, { content, tone });

    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      data: updatedPost,
    });
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to update post",
    });
  }
};

/**
 * Delete a post
 * DELETE /api/posts/:postId
 */
exports.deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: "Post not found",
      });
    }

    // Verify ownership
    if (post.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: "You don't have permission to delete this post",
      });
    }

    const deleted = await Post.delete(postId);

    if (deleted) {
      res.status(200).json({
        success: true,
        message: "Post deleted successfully",
      });
    } else {
      res.status(400).json({
        success: false,
        error: "Failed to delete post",
      });
    }
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to delete post",
    });
  }
};

/**
 * Mark a post as posted to Facebook
 * PATCH /api/posts/:postId/facebook
 * Body: { facebookPostId }
 */
exports.markAsPostedToFacebook = async (req, res) => {
  try {
    const { postId } = req.params;
    const { facebookPostId } = req.body;
    const userId = req.user.id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: "Post not found",
      });
    }

    // Verify ownership
    if (post.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: "You don't have permission to modify this post",
      });
    }

    const updatedPost = await Post.update(postId, {
      posted_to_facebook: true,
      facebook_post_id: facebookPostId,
    });

    res.status(200).json({
      success: true,
      message: "Post marked as posted to Facebook",
      data: updatedPost,
    });
  } catch (error) {
    console.error("Error marking post as posted:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to update post status",
    });
  }
};
