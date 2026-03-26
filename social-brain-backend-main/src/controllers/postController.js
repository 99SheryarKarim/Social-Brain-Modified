const { createPost } = require("../presenters/postPresenter");
const { getUserPosts } = require("../presenters/postPresenter");

const uploadPost = async (req, res) => {
  try {
    const postData = {
      content: req.body.content,
      createdAt: new Date(),
      userId: req.user.userID,
    };

    const mediaFiles = req.files || [];

    const savedPost = await createPost(postData, mediaFiles);

    res.status(201).json(savedPost);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// get posts

const getMyPosts = async (req, res) => {
  try {
    const userId = req.user.userID;
    const posts = await getUserPosts(userId);
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { uploadPost, getMyPosts };
