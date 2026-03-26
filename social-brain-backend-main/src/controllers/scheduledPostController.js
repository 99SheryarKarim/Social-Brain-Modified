const { createScheduledPost, getUserScheduledPosts } = require("../presenters/scheduledPostPresenter");

const schedulePost = async (req, res) => {
  console.log("Received request to schedule post:", req.body);
  try {
    const postData = {
      content: req.body.content,
      scheduledTime: new Date(req.body.scheduledTime),
    };

    const mediaFiles = req.files || [];
    const userId = req.user.userID; // ✅ Extract userId from JWT

    const savedPost = await createScheduledPost(postData, mediaFiles, userId); // ✅ Pass it in

    res.status(201).json(savedPost);
  } catch (error) {
    console.log('error from controller:', error);
    res.status(500).json({ error: error.message });
  }
};



// get posts
const getMyScheduledPosts = async (req, res) => {
  console.log("Fetching scheduled posts for user in controller:", req.user.userID);
  try {
    const userId = req.user.userID; // extracted from JWT
    const posts = await getUserScheduledPosts(userId);

    console.log("Scheduled posts fetched:", posts);
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  schedulePost,
  getMyScheduledPosts,
};
